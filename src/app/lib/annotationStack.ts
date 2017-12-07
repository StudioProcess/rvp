import {List, Record, Set} from 'immutable'

import {Annotation} from '../persistence/model'
import {binarySearch} from '../lib/search'
import {hasCollisionFactory} from './collision'
import {sortFactory} from './sort'

const recordSort = sortFactory<Record<Annotation>, number>(a => a.get('utc_timestamp', null))

const recordHasCollision = hasCollisionFactory<Record<Annotation>, number>(
  a => a.get('utc_timestamp', null),
  a => (a.get('utc_timestamp', null)+a.get('duration', null)))

function findHorizontalCollisions(list: List<Record<Annotation>>, indices: List<number>, checkSelf: boolean=false) {
  const collisions: {annotation: Record<Annotation>, index: number}[] = []
  const isInIndices = (k: number) => {
    if(checkSelf) {
      indices.find(i => i === k) !== undefined
    } else {
      return false
    }
  }

  let n = 1
  let nextIndex
  indices.forEach(i => {
    // Collision to right
    n = 1
    nextIndex = i+n
    while(nextIndex < list.size && !isInIndices(nextIndex) && recordHasCollision(list.get(i)!, list.get(nextIndex)!)) {
      collisions.push({annotation: list.get(nextIndex)!, index: nextIndex})
      nextIndex = i+(++n)
    }
    // Collision to left
    n = 1
    nextIndex = i-n
    while(nextIndex >= 0 && !isInIndices(nextIndex) && recordHasCollision(list.get(i)!, list.get(nextIndex)!)) {
      collisions.push({annotation: list.get(nextIndex)!, index: nextIndex})
      nextIndex = i-(++n)
    }
  })

  const uniqueMapIndexMap: {[key: number]: boolean} = {}
  return collisions.filter(({index}) => {
    if(uniqueMapIndexMap[index]) {
      return false
    } else {
      uniqueMapIndexMap[index] = true
      return true
    }
  })
}

function findVerticalCollisions(stacks: List<List<Record<Annotation>>>, stackStartIndex: number, annotations: List<Record<Annotation>>) {
  const collisions: {annotation: Record<Annotation>, index: number, annotationStackIndex: number}[] = []
  let spread = Set(annotations)
  for(let i = stackStartIndex; i < stacks.size; i++) {
    const stack = stacks.get(i)!
    const spreadList = spread.toList().sort(recordSort)
    const withInsertions = stack.concat(spreadList).sort(recordSort)
    const insertionIndices = spreadList.map(mapIndicesFunc(withInsertions))
    const hCollisions = findHorizontalCollisions(withInsertions, insertionIndices, true)

    spread = spread.union(hCollisions.map(({annotation}) => annotation))

    // Get actual indices of horiz. collisions
    stack.forEach((annotation, annotationIndex)  => {
      const isCollision = hCollisions.find(hColl => {
        return hColl.annotation.get('id', null) === annotation.get('id', null)
      }) !== undefined

      if(isCollision) {
        collisions.push({annotation, index: annotationIndex, annotationStackIndex: i})
      }
    })
  }
  return collisions
}

const mapIndicesFunc = (stack: List<Record<Annotation>>) => (annotation: Record<Annotation>) => {
  return binarySearch(stack, stack.size, (list, i) => {
    return list.getIn([i, 'utc_timestamp'])
  }, annotation.get('utc_timestamp', null))
}

export function embedAnnotations(annotationStacks: List<List<Record<Annotation>>>, annotationStackIndex: number,
  addAnnotations: List<Record<Annotation>>, removeAnnotations: List<Record<Annotation>>): List<List<Record<Annotation>>> {
  if(annotationStackIndex < 0 || annotationStackIndex >= annotationStacks.size) {
    return annotationStacks
  }
  const stack = annotationStacks.get(annotationStackIndex)!

  const withRemovals = stack.filter(a => {
    return removeAnnotations.find(annotation => {
      return annotation.get('id', null) === a.get('id', null)
    }) === undefined
  })

  let updatedStacks = annotationStacks.set(annotationStackIndex, withRemovals)
  const vCollisions = findVerticalCollisions(updatedStacks, annotationStackIndex+1, removeAnnotations)

  updatedStacks = updatedStacks.withMutations(mStacks => {
    mStacks.forEach((stack, stackIndex) => {
      const filtered = stack.filter((annotation, annotationIndex) => {
        return vCollisions.find(vColl => {
          return vColl.index === annotationIndex && vColl.annotationStackIndex === stackIndex
        }) === undefined
      })
      mStacks.set(stackIndex, filtered)
    })
  })

  const withInsertions = withRemovals.concat(addAnnotations).sort(recordSort)

  const insertionIndices = addAnnotations.map(mapIndicesFunc(withInsertions))

  const hCollisions: {annotation: Record<Annotation>, index: number}[] = findHorizontalCollisions(withInsertions, insertionIndices)

  const collisions = vCollisions.map(({annotation, index}) => ({annotation, index})).concat(hCollisions)

  if(collisions.length > 0) {
    const withoutHCollisions = withInsertions.filter((a, i) => {
      return hCollisions.find(({index}) => {
        return i === index
      }) === undefined
    })
    const stackInsertions = updatedStacks.set(annotationStackIndex, withoutHCollisions)
    const stacksFitted = fitOptimized(stackInsertions, List(collisions.map(({annotation}) => annotation)))
    const maxSize = Math.max(stackInsertions.size, stacksFitted.size)

    let tmp: List<List<Record<Annotation>>> = List()
    const ret = tmp.withMutations(mRet => {
      for(let i = 0; i < maxSize; i++) {
        if(i < stackInsertions.size && i < stacksFitted.size) {
          mRet.push(stackInsertions.get(i)!.concat(stacksFitted.get(i)!).sort(recordSort))
        } else if(i < stackInsertions.size) {
          mRet.push(stackInsertions.get(i)!)
        } else {
          mRet.push(stacksFitted.get(i)!)
        }
      }
    })
    return ret.filter(stack => stack.size > 0)
  } else {
    return annotationStacks.set(annotationStackIndex, withInsertions)
  }
}

function fitOptimized(annotationStacks: List<List<Record<Annotation>>>, annotations: List<Record<Annotation>>) {
  let fittedStacks: Array<List<Record<Annotation>>> = []
  let rest = annotations
  for(let i = 0; i < annotationStacks.size; i++) {
    const stack = annotationStacks.get(i)!
    const collisions = []
    let updatedStack = stack
    let justFitted = []
    for(let j = 0; j < rest.size; j++) {
      const annotation = rest.get(j)!
      // TODO: instead of concat+sort+binarysearch, just insert sorted
      const withInsertion = updatedStack.concat(List([annotation])).sort(recordSort)
      const insertionIndex = binarySearch(withInsertion, withInsertion.size, (list, k) => {
        return list.getIn([k, 'utc_timestamp'])
      }, annotation.get('utc_timestamp', null))

      if(findHorizontalCollisions(withInsertion, List([insertionIndex])).length > 0) {
        collisions.push(annotation)
      } else {
        justFitted.push(annotation)
        updatedStack = withInsertion
      }
    }
    fittedStacks.push(List(justFitted.sort(recordSort)))
    rest = List(collisions)
  }

  if(rest.size > 0) {
    fittedStacks.push(rest.sort(recordSort))
  }

  return List(fittedStacks)
}
