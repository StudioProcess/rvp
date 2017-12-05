import {List, Record} from 'immutable'

import {Annotation} from '../persistence/model'
import {binarySearch} from '../lib/search'
import {hasCollisionFactory} from './collision'
import {sortFactory} from './sort'

const recordSort = sortFactory<Record<Annotation>, number>(a => a.get('utc_timestamp', null))

const recordHasCollision = hasCollisionFactory<Record<Annotation>, number>(
  a => a.get('utc_timestamp', null),
  a => (a.get('utc_timestamp', null)+a.get('duration', null)))

export function embedAnnotation(annotationStacks: List<List<Record<Annotation>>>, annotations: List<Record<Annotation>>): List<List<Record<Annotation>>> {
  const firstStack = !annotationStacks.isEmpty() ? annotationStacks.get(0, null)! : List([])
  // O(n+m) + O(n+m)
  const updatedStack = firstStack.concat(annotations).sort(recordSort)

  // O(m * log n)
  const insertionIndices = annotations.map(annotation => {
    return binarySearch(updatedStack, updatedStack.size, (list, i) => {
      return list.getIn([i, 'utc_timestamp'])
    }, annotation.get('utc_timestamp', null))
  })

  // O(i*c)
  const colliding: {annotation: Record<Annotation>, index: number}[] = []
  let n = 1
  let nextIndex
  insertionIndices.forEach(i => {
    // Collision to right
    n = 1
    nextIndex = i+n
    while(nextIndex < updatedStack.size && recordHasCollision(updatedStack.get(i)!, updatedStack.get(nextIndex)!)) {
      colliding.push({annotation: updatedStack.get(nextIndex)!, index: nextIndex})
      nextIndex = i+(++n)
    }
    // Collision to left
    n = 1
    nextIndex = i-n
    while(nextIndex >= 0 && recordHasCollision(updatedStack.get(i)!, updatedStack.get(nextIndex)!)) {
      colliding.push({annotation: updatedStack.get(nextIndex)!, index: nextIndex})
      nextIndex = i-(++n)
    }
  })

  if(colliding.length > 0) {
    const collidingRemoved = updatedStack.filter((a, i) => {
      return colliding.find(({index}) => {
        return i === index
      }) === undefined
    })
    const mappedColliding = colliding.map(({annotation}) => annotation)
    return List([collidingRemoved]).concat(embedAnnotation(annotationStacks.slice(1), List(mappedColliding)))
  } else {
    return List([updatedStack]).concat(annotationStacks.slice(1))
  }
}
