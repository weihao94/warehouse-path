import { round } from "lodash"

import { Matrix, Locations, Location } from "./interface"
import { nbStepsForAPickerTour, uniqLocations } from "./utils"
import { createPathBetweenManyLocations } from "./path"
import { createShortestPath } from "./algos/closestNeighbour"
import { createShorterSShapedPath } from "./algos/sShapedLocations"
import { createShortestPathViaEllipse } from "./algos/ellipse"
import { drawWarehouse, highlightPathBetweenManyLocations } from "./display"
import { pickerTourInSequence, startAndEndAtSameALocation } from "./transform"

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Final functions display, calculate differences between differents algo //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// testClosestNeightbourAgainstSShapedOnManyBatchesReduce :: [Array] -> [Array] -> String -> Function -> Object
export function closestNeightbourAgainstSShapedOnManyBatchesReduce(matrix:Matrix, listOfBatches:Locations[], sortingArea:Location, functionToApply) {
	return listOfBatches.reduce(function(prev, cur, index) {
		// S-Shaped
		let sShaped = nbStepsForAPickerTour(createPathBetweenManyLocations(matrix, createShorterSShapedPath(sortingArea, cur, functionToApply)))
		// Shortest path
		let shortest = nbStepsForAPickerTour(createPathBetweenManyLocations(matrix, createShortestPath(matrix, sortingArea, cur, functionToApply)))

		console.log(`ClosestNeighbour against S-Shaped : Result ${index} = nbStepsForAPickerTour sShaped ${sShaped} nbStepsForAPickerTour shortest  ${shortest} gain ${shortest - sShaped} so ${round((shortest - sShaped) / sShaped * 100, 2)} %`)

		prev.sShaped += sShaped
		prev.shortest += shortest
		prev.shortestGainOverSShaped += shortest - sShaped

		return prev
	}, { sShaped: 0, shortest: 0, shortestGainOverSShaped: 0 })
}

// testEllipseAgainstSShapedOnManyBatchesReduce :: [Array] -> [Array] -> String -> Function -> Object
export function ellipseAgainstSShapedOnManyBatchesReduce(matrix:Matrix, listOfBatches:Locations[], sortingArea:Location, functionToApply) {
	return listOfBatches.reduce((prev, cur, index) => {
		// S-Shaped
		let sShaped = nbStepsForAPickerTour(createPathBetweenManyLocations(matrix, createShorterSShapedPath(sortingArea, cur, functionToApply)))
		// Shortest via ellipse
		let ellipse = nbStepsForAPickerTour(createPathBetweenManyLocations(matrix, createShortestPathViaEllipse(matrix, sortingArea, cur, functionToApply)))

		console.log(`Ellipse against S-Shaped : Result ${index} = nbStepsForAPickerTour sShaped ${sShaped} nbStepsForAPickerTour ellipse  ${ellipse} gain ${ellipse - sShaped} so ${round((ellipse - sShaped) / sShaped * 100, 2)} %`)

		prev.sShaped += sShaped
		prev.ellipse += ellipse
		prev.ellipseGainOverSShaped += ellipse - sShaped
		return prev
	}, { sShaped: 0, ellipse: 0, ellipseGainOverSShaped: 0 })
}

// testClosestNeightbourAgainstSShapedOnManyBatchesDisplay :: [Array] -> [Array] -> String -> Function  -> Number -> Boolean -> ?
export function closestNeightbourAgainstSShapedOnManyBatchesDisplay(matrix:Matrix, listOfBatches:Locations[], sortingArea:Location, functionToApply, nbLocations = 1, cleanUp = false) {
	return listOfBatches.map((cur:Locations, index) => {
		if (cleanUp === true) {
			$(`.row${index}`).remove()
			$(`.superRow${index}`).remove()
		}

		// S-Shaped
		let nodeMatrix = drawWarehouse(matrix, "body", `row${index}`)
		highlightPathBetweenManyLocations(
			nodeMatrix,
			pickerTourInSequence(
				createPathBetweenManyLocations(matrix, createShorterSShapedPath(sortingArea, cur, functionToApply)),
				nbLocations
			)
		)
		// Shortest path
		let nodeMatrix1 = drawWarehouse(matrix, "body", `superRow${index}`)
		highlightPathBetweenManyLocations(
			nodeMatrix1,
			pickerTourInSequence(
				createPathBetweenManyLocations(matrix, createShortestPath(matrix, sortingArea, cur, functionToApply)),
				nbLocations
			)
		)
	})
}

// testEllipseAgainstSShapedOnManyBatchesDisplay :: [Array] -> [Array] -> String -> Function  -> Number -> Boolean -> ?
export function ellipseAgainstSShapedOnManyBatchesDisplay(matrix:Matrix, listOfBatches:Locations[], sortingArea:Location, functionToApply, nbLocations = 1, cleanUp = false) {
	return listOfBatches.map((cur, index) => {
		if (cleanUp === true) {
			$(`.row${index}`).remove()
			$(`.superRow${index}`).remove()
		}

		// S-Shaped
		let nodeMatrix = drawWarehouse(matrix, "body", `row${index}`)
		highlightPathBetweenManyLocations(
			nodeMatrix,
			pickerTourInSequence(
				createPathBetweenManyLocations(matrix,createShorterSShapedPath(sortingArea,	cur,functionToApply)),
				nbLocations
			)
		)

		// Ellipse path
		let nodeMatrix1 = drawWarehouse(matrix, "body", `superRow${index}`)
		highlightPathBetweenManyLocations(
			nodeMatrix1,
			pickerTourInSequence(
				createPathBetweenManyLocations(matrix,createShortestPathViaEllipse(	matrix,	sortingArea,cur,functionToApply)),
				nbLocations
			)
		)
	})
}

// testClosestNeightbourAgainstSShapedOnManyBatchesResultForCSV::[Array] -> [Array] -> String -> Function -> [Object]
export function closestNeightbourAgainstSShapedOnManyBatchesResultForCSV(matrix:Matrix, listOfBatches:Locations[], sortingArea:Location, functionToApply, tagToAppendResults = "body") {
	let results = []

	listOfBatches.map((cur, index) => {
		let pickerTour = startAndEndAtSameALocation(sortingArea, uniqLocations(cur))

		// S-Shaped
		let sShaped = nbStepsForAPickerTour(createPathBetweenManyLocations(matrix, createShorterSShapedPath(sortingArea, cur, functionToApply)))
		// Shortest path
		let shortest = nbStepsForAPickerTour(createPathBetweenManyLocations(matrix, createShortestPath(matrix, sortingArea, cur, functionToApply)))

		let resultForABatch = {
			pickerTourLength: pickerTour.length,
			sShapedSteps: sShaped,
			shortestSteps: shortest,
			diff: shortest - sShaped,
			gain: round((shortest - sShaped) / sShaped * 100, 2)
		}

		return results.push(resultForABatch)
	})

	let str = JSON.stringify(results, null, 4)

	return $(tagToAppendResults).append(`<code>${str}</code>`)
}

// testEllipseAgainstSShapedOnManyBatchesResultForCSV::[Array] - > [Array] -> String -> Function -> [Object]
export function ellipseAgainstSShapedOnManyBatchesResultForCSV(matrix:Matrix, listOfBatches:Locations[], sortingArea:Location, functionToApply, tagToAppendResults = "body") {
	let results = []

	listOfBatches.map((cur, index) => {
		let pickerTour = startAndEndAtSameALocation(sortingArea, uniqLocations(cur))

		// S-Shaped
		let sShaped = nbStepsForAPickerTour(createPathBetweenManyLocations(matrix, createShorterSShapedPath(sortingArea, cur, functionToApply)))
		// Shortest via ellipse
		let ellipse = nbStepsForAPickerTour(createPathBetweenManyLocations(matrix, createShortestPathViaEllipse(matrix, sortingArea, cur, functionToApply)))

		let resultForABatch = {
			pickerTourLength: pickerTour.length,
			sShapedSteps: sShaped,
			ellipseSteps: ellipse,
			diff: ellipse - sShaped,
			gain: round((ellipse - sShaped) / sShaped * 100, 2)
		}

		return results.push(resultForABatch)
	})

	let str = JSON.stringify(results, null, 4)

	return $(tagToAppendResults).append(`<code>${str}</code>`)
}