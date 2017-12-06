import {List, Record} from 'immutable'

import {Annotation} from '../persistence/model'
import {binarySearch} from '../lib/search'
import {hasCollisionFactory} from './collision'
import {sortFactory} from './sort'

const recordSort = sortFactory<Record<Annotation>, number>(a => a.get('utc_timestamp', null))

const recordHasCollision = hasCollisionFactory<Record<Annotation>, number>(
  a => a.get('utc_timestamp', null),
  a => (a.get('utc_timestamp', null)+a.get('duration', null)))

function findCollisions(list: List<Record<Annotation>>, indices: List<number>) {
  const collisions: {annotation: Record<Annotation>, index: number}[] = []

  let n = 1
  let nextIndex
  indices.forEach(i => {
    // Collision to right
    n = 1
    nextIndex = i+n
    while(nextIndex < list.size && recordHasCollision(list.get(i)!, list.get(nextIndex)!)) {
      collisions.push({annotation: list.get(nextIndex)!, index: nextIndex})
      nextIndex = i+(++n)
    }
    // Collision to left
    n = 1
    nextIndex = i-n
    while(nextIndex >= 0 && recordHasCollision(list.get(i)!, list.get(nextIndex)!)) {
      collisions.push({annotation: list.get(nextIndex)!, index: nextIndex})
      nextIndex = i-(++n)
    }
  })

  return collisions
}

export function embedAnnotations(annotationStacks: List<List<Record<Annotation>>>, annotationStackIndex: number, annotations: List<Record<Annotation>>): List<List<Record<Annotation>>> {
  if(annotationStackIndex >= annotationStacks.size) {
    return annotationStacks
  }
  const insertionStack = annotationStacks.get(annotationStackIndex)!
  // O(n+m) + O((n+m) log (n+m))
  // Complexity of sort impl depends of browser
  const withInsertions = insertionStack.concat(annotations).sort(recordSort)

  // O(m * log (n+m))
  const insertionIndices = annotations.map(annotation => {
    return binarySearch(withInsertions, withInsertions.size, (list, i) => {
      return list.getIn([i, 'utc_timestamp'])
    }, annotation.get('utc_timestamp', null))
  })

  // O(i*c)
  const collisions: {annotation: Record<Annotation>, index: number}[] = findCollisions(withInsertions, insertionIndices)

  if(collisions.length > 0) {
    const withoutCollisions = withInsertions.filter((a, i) => {
      return collisions.find(({index}) => {
        return i === index
      }) === undefined
    })
    const stacksWithInsertions = annotationStacks.set(annotationStackIndex, withoutCollisions)
    const stacksWithFitted = fitOptimized(stacksWithInsertions, List(collisions.map(({annotation}) => annotation)))
    const maxSize = Math.max(stacksWithInsertions.size, stacksWithFitted.size)
    let tmp: List<List<Record<Annotation>>> = List()
    const ret = tmp.withMutations(mRet => {
      for(let i = 0; i < maxSize; i++) {
        if(i < stacksWithInsertions.size && i < stacksWithFitted.size) {
          mRet.push(stacksWithInsertions.get(i)!.concat(stacksWithFitted.get(i)!).sort(recordSort))
        } else if(i < stacksWithInsertions.size) {
          mRet.push(stacksWithInsertions.get(i)!)
        } else {
          mRet.push(stacksWithFitted.get(i)!)
        }
      }
    })
    return ret
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

      if(findCollisions(withInsertion, List([insertionIndex])).length > 0) {
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
