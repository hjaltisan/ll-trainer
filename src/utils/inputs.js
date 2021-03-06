import _ from 'lodash'
import data from './data.json'
import all from '../algdb/pll/pll.json'


// List of all possible single sides
//  const possibleSides = {
//    fff: 1, ffr: 1, ffb: 1, frr: 1, frb: 1, frf: 1,
//    flf: 1, flr: 1, flb: 1, fbf: 1, fbb: 1, fbr: 1
//  }

// List of all possible side pairs
//  create this list programmatically and then store it for use as lookups

function getSolvedSide(input) {
    const values = [false, false, false, false]
    const arr = input.split('')
    for (let i = 0; i < 12; i += 3) {
        values[i/3] = arr[i] === arr[i+1] && arr[i] === arr[i+2]
    }
    return values
}

function getLights(input) {
    const values = [false, false, false, false]
    const arr = input.split('')
    for (let i = 0; i < 12; i += 3) {
        values[i/3] = arr[i] === arr[i+2] && arr[i] !== arr[i+1]
    }
    return values
}

function shift(input, by) {
    // take the first by out, and add them to the end
    return input.slice(by) + input.slice(0, by)
}

function shiftAndSlice(input, shiftBy, sliceTo) {
    return shift(input, shiftBy).slice(0, sliceTo)
}

function getSides(input) {
    return input.match(/.{1,3}/g)
}

  // Commenting out to pass build
  // eslint-disable-next-line
function getPairs(input) {
    const result = {}
    for (let i = 0; i < 4; i++) {
        result[shiftAndSlice(input, 3 * i, 6)] = true
    }
    return _.keys(result)
}

function getQuartets(input) {
    const result = {}
    for (let i = 0; i < 4; i++) {
        result[shift(input, 3 * i)] = true
    }
    return _.keys(result)
}
  
  function shiftRight(side) {
    const codes = ['f', 'r', 'b', 'l']
    let a = codes.indexOf(side) + 1
    if (a > 3) a = 0
    return codes[a]
  }
  
  function shiftLeft(side) {
    const codes = ['f', 'r', 'b', 'l']
    let a = codes.indexOf(side) - 1
    if (a < 0) a = 3
    return codes[a]
  }
  
  function neutralize(input, colorOnTop = 'Y') {
    // need to know what color is on top, to know how the colors relate to one another
    // can probably create only one for each and then create the rest programmatically by shifting
    // the keys...
    const neutralizationMaps = {
      Y: {
        G: { G: 'f', O: 'r', B: 'b', R: 'l'},
        O: { O: 'f', B: 'r', R: 'b', G: 'l'},
        B: { B: 'f', R: 'r', G: 'b', O: 'l'},
        R: { R: 'f', G: 'r', O: 'b', B: 'l'}
      },
      W: {
        G: { G: 'f', R: 'r', B: 'b', O: 'l'},
        R: { R: 'f', B: 'r', O: 'b', G: 'l'},
        B: { B: 'f', O: 'r', G: 'b', R: 'l'},
        O: { O: 'f', G: 'r', R: 'b', B: 'l'}
      },
      // Add for the other colors on top as well...
    }
    let key = input.charAt(0).toUpperCase()
    return input.split('').map(value => neutralizationMaps[colorOnTop][key][value.toUpperCase()]).join('')
  }
  
  function normalize(neutralizedInput) {
    const normalizationMaps = {
        f: { f: 'f', r: 'r', b: 'b', l: 'l'},
        r: { r: 'f', b: 'r', l: 'b', f: 'l'},
        b: { b: 'f', l: 'r', f: 'b', r: 'l'},
        l: { l: 'f', f: 'r', r: 'b', b: 'l'}
    }
    let counter = 0
    let key
    return neutralizedInput.split('').map(value => {
        counter += 1
        if (counter === 1 || counter === 4 || counter === 7 || counter === 10) key = value
        return normalizationMaps[key][value]
      }
    ).join('')
  }

  function deNormalize(normalizedInput, startOn = 'f') {
    const deNormalizationMaps = {
        f: { f: 'f', r: 'r', b: 'b', l: 'l'},
        r: { f: 'r', r: 'b', b: 'l', l: 'f'},
        b: { f: 'b', r: 'l', b: 'f', l: 'r'},
        l: { f: 'l', r: 'f', b: 'r', l: 'b'}
    }
    let key = startOn
    let counter = 0
    return normalizedInput.split('').reduce((res, value) => {
        counter += 1
        if (counter === 4 || counter === 7 || counter === 10) key = shiftRight(res.slice(-1)[0])
        res.push(deNormalizationMaps[key][value])
        return res
    }, []).join('')
  }
  
  export function getRandomColors(neutralizedInput, colorOnTop = 'Y') {
      return deNeutralize(neutralizedInput, _.sample(['R','G','B','O']), 'Y')
  }

  function deNeutralize(neutralizedInput, startOn, colorOnTop = 'Y') {
      const deNeutralizationMaps = {
      Y: {
        G: { f: 'G', r: 'O', b: 'B', l: 'R'},
        O: { f: 'O', r: 'B', b: 'R', l: 'G'},
        B: { f: 'B', r: 'R', b: 'G', l: 'O'},
        R: { f: 'R', r: 'G', b: 'O', l: 'B'}
      },
      W: {
        G: { f: 'G', r: 'R', b: 'B', l: 'O'},
        R: { f: 'R', r: 'B', b: 'O', l: 'G'},
        B: { f: 'B', r: 'O', b: 'G', l: 'R'},
        O: { f: 'O', r: 'G', b: 'R', l: 'B'}
      },
      // Add for the other colors on top as well...
    }
    let key = startOn
    return neutralizedInput.split('').map(value => deNeutralizationMaps[colorOnTop][key][value]).join('')
  }

  // Commenting out to pass build
  // eslint-disable-next-line
  function testProcess(input, colorOnTop = 'Y') {
      const startOn = input.charAt(0).toUpperCase()
      const upperCased = input.toUpperCase()
      const neutralized = neutralize(input, colorOnTop)
      const normalized = normalize(neutralized)
      const deNormalized = deNormalize(normalized) // should be same as neutralized
      const deNeutralized = deNeutralize(deNormalized, startOn, colorOnTop) // should be same as upperCased
      return {
          input,
          startOn,
          colorOnTop,
          upperCased,
          neutralized,
          normalized,
          deNormalized,
          deNeutralized,
          normalizationSuccessful: neutralized === deNormalized,
          neutralizationSuccessful: upperCased === deNeutralized
      }
  }

  function getSidePatterns(side) {
    
    const patterns = {
      fff: { solved: true },
      frf: { lights: { adjacent: 'right' } },
      flf: { lights: { adjacent: 'left' } },
      fbf: { lights: { opposite: true } },
      ffr: { bar: { left: true, adjacent: 'right' }},
      ffb: { bar: { left: true, opposite: true }},
      frr: { bar: { right: true, adjacent: 'right' }},
      fbb: { bar: { right: true, opposite: true }},
      frb: { diverse: true },
      fbr: { diverse: true },
      flb: { diverse: true },
      flr: { diverse: true },
    }
    return patterns[normalize(side)]
  }
  
  export function getSidePairPatterns(pair) {
    // Make sure side is normalized
    const n = normalize(pair)
    // console.log(n)
    const sides = getSides(n)

    const p1 = getSidePatterns(sides[0])
    const p2 = getSidePatterns(sides[1])

    const result = {}

    // result.front = p1
    // result.right = p2

    if (p1.solved && p2.solved) {
        result.cubeSolved = true
    } else if (p1.solved) {
        result.solved = 'front'
    } else if (p2.solved) {
        result.solved = 'right'
    }

    if (p1.lights && p2.lights) {
        result.doubleLights = {}
        if (p1.lights.adjacent && p2.lights.adjacent) {
            if (p1.lights.adjacent === p2.lights.adjacent) {
                // result.adjacentDoubleLights = p1.lights.adjacent
                result.doubleLights.adjacent = p1.lights.adjacent
            } else {
                result.doubleLights.adjacent = 'mixed'
            }
        } else if (p1.lights.opposite && p2.lights.opposite) {
            result.doubleLights.opposite = true
        } else {
            result.doubleLights.mixed = true
        }
    } else if (p1.lights) {
        result.lights = { front: true }
        if (p1.lights.adjacent) result.lights.adjacent = p1.lights.adjacent
        if (p1.lights.opposite) result.lights.opposite = true
    }
    else if (p2.lights) {
        result.lights = { right: true }
        if (p2.lights.adjacent) result.lights.adjacent = p2.lights.adjacent
        if (p2.lights.opposite) result.lights.opposite = true
    }

    if (p1.bar && p2.bar) {
        result.doubleBar = {}
        if (p1.bar.left && p2.bar.right) {
            result.doubleBar.outer = true
            result.doubleBar.opposite = true
        } else {
            if (p1.bar.right && p2.bar.left) {
                result.doubleBar.inner = true
            } else {
                if (p1.bar.left) result.doubleBar.sameSide = 'left'
                if (p1.bar.right) result.doubleBar.sameSide = 'right'
            }
            if (p1.bar.adjacent && p2.bar.adjacent) {
                result.doubleBar.adjacent = true
            } else if (p1.bar.opposite && p2.bar.opposite) {
                result.doubleBar.opposite = true
            } else {
                result.doubleBar.mixed = true
            }
        }
    } else if (p1.bar) {
        result.bar = { front: true }
        if (p1.bar.left) result.outerBar = true
        if (p1.bar.right) result.innerBar = true
        if (p1.bar.adjacent) result.bar.adjacent = p1.bar.adjacent
        if (p1.bar.opposite) result.bar.opposite = p1.bar.opposite
    } else if (p2.bar) {
        result.bar = { right: true }
        if (p2.bar.left) result.innerBar = true
        if (p2.bar.right) result.outerBar = true
        if (p2.bar.adjacent) result.bar.adjacent = p2.bar.adjacent
        if (p2.bar.opposite) result.bar.opposite = p2.bar.opposite
    }

    if (p1.diverse && p2.diverse) {
        result.completelyDiverse = true
    } else if (p1.diverse) {
        result.diverse = 'front'
    } else if (p2.diverse) {
        result.diverse = 'right'
    }

    const arr = (deNormalize(pair)).split('')

    if (arr[0] === arr[5]) result.bookends = true

    // No checkers or such on a solved cube
    if (!result.cubeSolved) {
        // do we have at least 1,3,5 (2:1) pattern
        if (arr[2] === 'f' && arr[4] === 'f') {
            if (arr[1] === arr[3] && arr[1] === arr[5]) {
                result.checkerBoard = true
            } else if (arr[1] === arr[3]) {
                result.checker = { front: true, length: 5}
            } else {
                result.twoOne = 'front'
            }
        } else if (arr[1] === arr[3] && arr[1] === arr[5]) {
            if (arr[2] === arr[4]) {
                result.checker = { right: true, length: 5}
            } else {
                result.twoOne = 'right'
            }

        // test for a 4 checker
        } else if (arr[2] === 'f' && arr[1] === arr[3]) {
            result.checker = { front: true, length: 4 }
        } else if (arr[3] === arr[5] && arr[2] === arr[4]) {
            result.checker = { right: true, length: 4 }
        
        // check for outer checker
        } else if (arr[4] === 'f' && arr[1] === arr[5]) {
            result.outerChecker = true
        
        // check for inner checker
        } else if (arr[1] === arr[3] && arr[2] === arr[4]) {
            result.innerChecker = true

        // check for 5 checker with odd middle
        } else if (!result.bookends && arr[4] === 'f' && arr[1] === arr[3]) {
            result.oddMiddleChecker = 'front'
        } else if (!result.bookends && arr[1] === arr[5] && arr[2] === arr[4]) {
            result.oddMiddleChecker = 'right'
        
        
        // check for partial inner checkers
        } else if (arr[1] === arr[3]) {
            result.partialInnerChecker = { front: true }
            if (arr[1] === 'b') {
                result.partialInnerChecker.opposite = true
            } else if (arr[1] === 'r') {
                result.partialInnerChecker.adjacent = 'right'
            } else {
                result.partialInnerChecker.adjacent = 'left'
            }
        } else if (arr[2] === arr[4]) {
            // todo: check if arr[4] is adjacent or opposite to arr[5]
            result.partialInnerChecker = { right: true }
            if (shiftLeft(arr[4]) === arr[5]) {
                result.partialInnerChecker.adjacent = 'left'
            } else if (shiftRight(arr[4]) === arr[5]) {
                result.partialInnerChecker.adjacent = 'right'
            } else {
                result.partialInnerChecker.opposite = true
            }
        }
    }
    
    // color counts
    // const counter = { f: 1, r: 0, b: 0, l: 0 }
    result.colorCount = _.size(arr.reduce((r, v) => {r[v] = 1; return r}, {}))
    // counter[arr[2]] = 1
    // counter[arr[3]] = 1
    // counter[arr[5]] = 1

    // // const cornerColorCount = _.sum(_.values(counter))

    // counter[arr[1]] = 1
    // counter[arr[4]] = 1

    // result.colorCount = _.sum(_.values(counter))

    // Corner data
    // result.corners = { colorCount: cornerColorCount }

    // if (cornerColorCount === 2) {
    //     result.corners.solved = true
    //     result.corners.lights = 'All'
    // } else if (cornerColorCount === 4) {
    //     result.corners.diagonal = true
    //     result.corners.lights = 'None'
    // } else {
    //     result.corners.adjacent = true
    //     if (arr[2] === 'f') {
    //         result.corners.lights = 'Front'
    //     } else if (arr[2] === 'b') {
    //         result.corners.lights = 'Back'
    //     } else if (arr[5] === 'b') {
    //         result.corners.lights = 'Right'
    //     } else {
    //         result.corners.lights = 'Left'
    //     }
    // }

    // result.edges = {}

    // // edge data
    // if (shiftRight(arr[1]) === arr[4]) {
    //     result.edges.solved = true
    // } else if (shiftLeft(arr[4]) === arr[1]) {
    //     result.edges.reversed = true
    // } else {
    //     result.edges.opposite = true
    // }
    // 
    
    return result
  }

  // todo add isNormalized og isNeutralized functionum

  function getColored(categoryBold, lookForBold) {
      const result = []
      for (let i=0; i<6; i++) {
          result.push(categoryBold[i] || lookForBold[i])
      }
      return result
  }

  export function getRecognitions(pair) {
    //   console.log('getRecognitions', pair)
      const p = getSidePairPatterns(pair)
      const result = {}

      const bold = {
          none: [false, false, false],
          solved: [true, true, true],
          bar: {
              left: [true, true, false],
              right: [false, true, true],
          },
          lights: [true, false, true],
          left: [true, false, false],
          middle: [false, true, false],
          right: [false, false, true],
      }
      bold.bookends = bold.left.concat(bold.right)

      // todo: colorless er svo haegt ad reikna ut
      // thad eru their sem eru false baedi i bold undir
      // categoriunni og undir lookforinu

      if (p.solved) {
          result.category = {
              name: '3-Bar',
              bold: p.solved === 'front'
                ? bold.solved.concat(bold.none)
                : bold.none.concat(bold.solved),
          }
          if (p.lights) {
              result.lookFor = {
                  description: 'lights',
                  bold: p.lights.front
                    ? bold.lights.concat(bold.none)
                    : bold.none.concat(bold.lights),
              }
              result.cases = 'U'
          } else if (p.bar) {
              result.lookFor = {
                  description: '2-bar',
                  bold: p.bar.front
                    ? p.innerBar ? bold.bar.right.concat(bold.none) : bold.bar.left.concat(bold.none)
                    : p.innerBar ? bold.none.concat(bold.bar.left) : bold.none.concat(bold.bar.right)
              }
              result.cases = 'J'
          } else {
              result.lookFor = {
                  description: '4-colors',
                  bold: p.solved === 'front'
                    ? bold.none.concat(bold.solved)
                    : bold.solved.concat(bold.none),
              }
              result.cases = 'F'
          }
      } else if (p.doubleLights) {
          result.category = {
              name: 'Double Lights',
              bold: bold.lights.concat(bold.lights),
          }
          if (p.checkerBoard) {
              result.lookFor = {
                  description: '2-color 6-checker',
                  bold: bold.solved.concat(bold.solved),
              }
              result.cases = 'Z'
          } else if (p.colorCount === 4 && p.doubleLights.adjacent) {
              result.lookFor = {
                  description: 'adj edges & 4-colors',
                  bold: bold.middle.concat(bold.middle),
              }
              result.cases = 'Z'
          } else if (p.colorCount === 4 && p.doubleLights.opposite) {
              result.lookFor = {
                description: 'opp edges & 4-colors',
                bold: bold.middle.concat(bold.middle),
              }
              result.cases = 'H'
          } else {
              result.lookFor = {
                  description: '2:1 pattern & 3-colors',
                  bold: p.twoOne === 'front'
                    ? bold.lights.concat(bold.middle)
                    : bold.middle.concat(bold.lights),
              }
              result.cases = 'U'
          }
      } else if (p.lights && p.bar) {
          result.category = {
              name: 'Lights + 2-Bar',
              bold: p.bar.front
                ? p.outerBar ? bold.bar.left.concat(bold.lights) : bold.bar.right.concat(bold.lights)
                : p.outerBar ? bold.lights.concat(bold.bar.right) : bold.lights.concat(bold.bar.left),
          }
          result.lookFor = {
            bold: p.bar.front
              ? p.innerBar ? bold.left.concat(bold.middle) : bold.right.concat(bold.middle)
              : p.innerBar ? bold.middle.concat(bold.right) : bold.middle.concat(bold.left),
          }
          if (p.innerBar && p.colorCount === 3) {
              result.lookFor.description = 'inside bar & 3-colors'
              result.cases = 'T'
          } else if (p.innerBar) {
              result.lookFor.description = 'inside bar & 4-colors'
              result.cases = 'R'
          } else if (p.outerBar && p.colorCount === 3) {
              result.lookFor.description = 'outer bar & 3-colors'
              result.cases = 'A'
          } else {
              result.lookFor.description = 'outer bar & 4-colors'
              result.cases = 'Ga/c'
          }
      } else if (p.lights) {
          result.category = {
              name: 'Lone Lights',
              bold: p.lights.front
                ? bold.lights.concat(bold.none)
                : bold.none.concat(bold.lights)
          }
          if (p.checker && p.checker.length === 5) {
              result.lookFor = {
                  description: '5-checker',
                  bold: p.checker.front
                    ? bold.solved.concat(bold.bar.left)
                    : bold.bar.right.concat(bold.solved),
              }
              result.cases = 'R'
          } else if (p.checker && p.checker.length === 4) {
            result.lookFor = {
                description: '4-checker',
                bold: p.checker.front
                  ? bold.solved.concat(bold.left)
                  : bold.right.concat(bold.solved),
            }
            result.cases = 'Ga/c'
          } else if (p.lights.opposite) {
            result.lookFor = {
                description: 'lights enclose opp',
                bold: p.lights.front
                  ? bold.middle.concat(bold.none)
                  : bold.none.concat(bold.middle),
            }
            result.cases = 'Gb/d'
          } else {
            result.lookFor = {
                description: 'lights enclose adj (but no checker)',
                bold: p.lights.front
                  ? bold.middle.concat(bold.none)
                  : bold.none.concat(bold.middle),
            }
            result.cases = 'A'
          }
      } else if (p.doubleBar) {
          result.category = {
              name: 'Double Bar',
              bold: p.doubleBar.outer
                ? bold.bar.left.concat(bold.bar.right)
                : p.doubleBar.inner
                    ? bold.bar.right.concat(bold.bar.left)
                    : p.doubleBar.sameSide === 'left'
                        ? bold.bar.left.concat(bold.bar.left)
                        : bold.bar.right.concat(bold.bar.right),
          }
          if (p.doubleBar.outer) {
            result.lookFor = {
                description: 'both outside',
                bold: bold.bar.left.concat(bold.bar.right),
            }
            result.cases = 'Y'
          } else if (p.doubleBar.inner && p.bookends) {
            result.lookFor = {
                description: 'both inside & bookends',
                bold: bold.bookends,
            }
            result.cases = 'A'
          } else if (p.doubleBar.inner) {
            result.lookFor = {
                description: 'bothn inside & no bookends',
                bold: bold.bookends,
            }
            result.cases = 'V'
          } else if (p.bookends) {
            result.lookFor = {
                description: 'same side & bookends',
                bold: p.doubleBar.sameSide === 'left'
                  ? bold.bar.left.concat(bold.right)
                  : bold.left.concat(bold.bar.right),
            }
            result.cases = 'J'
          } else {
            result.lookFor = {
                description: 'same side & no bookends',
                bold: p.doubleBar.sameSide === 'left'
                  ? bold.bar.left.concat(bold.right)
                  : bold.left.concat(bold.bar.right),
            }
            result.cases = 'N'
          }
      } else if (p.outerBar) {
          result.category = {
              name: 'Outside 2-Bar',
              bold: p.bar.front
                ? bold.bar.left.concat(bold.none)
                : bold.none.concat(bold.bar.right),
          }
          if (!p.bookends) {
            result.lookFor = {
                description: 'no bookends',
                bold: p.bar.front
                  ? bold.bar.left.concat(bold.right)
                  : bold.left.concat(bold.bar.right),
            }
            result.cases = 'V'
          } else if (p.partialInnerChecker && p.partialInnerChecker.adjacent) {
            result.lookFor = {
                description: 'adj appears twice',
                bold: p.bar.front
                  ? bold.right.concat(bold.middle)
                  : bold.middle.concat(bold.left),
            }
            result.cases = 'R'
          } else if (p.partialInnerChecker) {
            result.lookFor = {
                description: 'opp appears twice',
                bold: p.bar.front
                ? bold.right.concat(bold.middle)
                : bold.middle.concat(bold.left),
            }
            result.cases = 'Gb/d'
          } else if (p.bar.adjacent) {
            result.lookFor = {
                description: 'adj by bar & 4-colors',
                bold: p.bar.front
                  ? bold.right.concat(bold.none)
                  : bold.none.concat(bold.left),
            }
            result.cases = 'T'
          } else {
            result.lookFor = {
                description: 'opp by bar & 4-colors',
                bold: p.bar.front
                  ? bold.right.concat(bold.none)
                  : bold.none.concat(bold.left),
            }
            result.cases = 'A'
          }
      } else if (p.innerBar) {
          result.category = {
              name: 'Inside 2-Bar',
              bold: p.bar.front
                ? bold.bar.right.concat(bold.none)
                : bold.none.concat(bold.bar.left),
          }
          result.lookFor = {
              bold: bold.bookends
          }
          if (p.bookends && p.bar.adjacent) {
            result.lookFor.description = 'bookends adj color'
            result.cases = 'Ga/c'
          } else if (p.bookends) {
            result.lookFor.description = 'bookends opp color'
            result.cases = 'Gb/d'
          } else {
            result.lookFor.description = 'no bookends'
            result.cases = 'Y'
          }
      } else if (p.bookends) {
          result.category = {
              name: 'Bookends',
              bold: bold.bookends,
          }
          if (p.innerChecker) {
            result.lookFor = {
                description: 'enclosed 4-checker',
                bold: bold.bar.right.concat(bold.bar.left),
            }
            result.cases = 'F'
          } else if (p.partialInnerChecker && p.partialInnerChecker.adjacent) {
            result.lookFor = {
                description: 'adj appears twice',
                bold: p.partialInnerChecker.front
                  ? bold.middle.concat(bold.left)
                  : bold.right.concat(bold.middle),
            }
            result.cases = 'R'
          } else {
            result.lookFor = {
                description: 'opp appears twice',
                bold: p.partialInnerChecker.front
                  ? bold.middle.concat(bold.left)
                  : bold.right.concat(bold.middle),
            }
            result.cases = 'Ga/c'
          }
      } else {
          result.category = {
              name: 'No Bookends',
              bold: bold.bookends,
          }
          if (p.innerChecker) {
            result.lookFor = {
                description: 'inner 4-checker',
                bold: bold.bar.right.concat(bold.bar.left),
            }
            result.cases = 'V'
          } else if (p.outerChecker) {
            result.lookFor = {
                description: 'outer 4-checker',
                bold: bold.bar.left.concat(bold.bar.right),
            }
            result.cases = 'Y'
          } else {
            result.lookFor = {
                description: '5-checker w/opp middle',
                bold: p.oddMiddleChecker === 'front'
                  ? bold.solved.concat(bold.bar.left)
                  : bold.bar.right.concat(bold.solved),
            }
            result.cases = 'E'
          }
      }
      result.category.colored = [...result.category.bold]
      result.lookFor.colored = getColored(result.category.bold, result.lookFor.bold)
      return result
  }
  
//   function getPllFromPatterns(pattern) {
//       if (pattern.solved) {
//           if (pattern.lights) {
//               return 'U'
//           }
//           if (pattern.bar) {
//               return 'J'
//           }
//           return 'F'
//       }

//       if (pattern.doubleLights) {
//           if (pattern.checkerBoard) {
//               return 'Z'
//           }
//           if (pattern.colorCount === 4) {
//               if (pattern.lights.adjacent) {
//                   return 'Z'
//               }
//               return 'H'
//           }
//           return 'U'
//       }

//       if (pattern.lights && pattern.bar) {
//           if (pattern.innerBar) {
//               if (pattern.colorCount === 3) {
//                   return 'T'
//               }
//               return 'R'
//           }
//           if (pattern.outerBar) {
//               if (pattern.colorCount === 3) {
//                   return 'A'
//               }
//               return 'Ga/c'
//           }
//       }

//       if (pattern.lights) {
//           if (pattern.checker && pattern.checker.length === 5) {
//               return 'R'
//           }
//           if (pattern.checker && pattern.checker.length === 4) {
//             return 'Ga/c'
//           }
//           if (pattern.ligths.opposite) {
//               return 'Gb/d'
//           }
//           return 'A'
//       }

//       if (pattern.doubleBar) {
//           if (pattern.doubleBar.outer) {
//               return 'Y'
//           }
//           if (pattern.doubleBar.inner) {
//               if (pattern.bookends) {
//                   return 'A'
//               }
//               return 'V'
//           }
//           if (pattern.doubleBar.sameSide) {
//               if (pattern.bookends) {
//                   return 'J'
//               }
//               return 'N'
//           }
//       }

//       if (pattern.outerBar) {
//           if (!pattern.bookends) {
//               return 'V'
//           }
//           if (pattern.partialInnerChecker) {
//               if (pattern.bar.adjacent) {
//                   return 'R'
//               }
//               return 'Gb/d'
//           }
//           if (pattern.bar.adjacent) {
//               return 'T'
//           }
//           return 'A'
//       }

//       if (pattern.innerBar) {
//           if (pattern.bookends) {
//               if (pattern.bar.adjacent) {
//                   return 'Ga/c'
//               }
//               return 'Gb/d'
//           }
//           return 'Y'
//       }

//       if (pattern.bookends) {
//           if (pattern.innerChecker) {
//               return 'F'
//           }
//           return 'R/Ga/c'
//       }

//       if (pattern.innerChecker) {
//           return 'V'
//       }
//       if (pattern.outerChecker) {
//           return 'Y'
//       }
//       return 'E'
//   }

  function getStats(s, size) {
    const result = {
        id: s.slice(0, size),
        remainder: s.slice(size, 12),
        lightsOn: getLights(s),
        solvedOn: getSolvedSide(s),
    }
    if (size === 3) {
        result.patterns = getSidePatterns(s.slice(0,3))
    } else if (size === 6) {
        const neutralized = deNormalize(s.slice(0,6))
        result.patterns = getSidePairPatterns(neutralized)
    }
    return result
}

  function workSomeMagic(name, input) {
    
    if (input == null) {
      return `Invalid input (${input})`
    }
    
    if (input.length === undefined || input.length !== 12) {
      return `Invalid input (incorrect input length) (${input})`
    }
    
    // first reduce to this format { B: 3, G: 3, O: 3, R: 3 }
    const sanityChecks = _.reduce(input.split(''), (result, value) => {
      const key = value.toUpperCase()
      if (result[key] === undefined) {
        result[key] = 0
      }
      result[key] += 1
      return result
    }, {})
  
    //console.log(sanityChecks)
    if (_.keys(sanityChecks).length !== 4) {
      return `Invalid input (incorrect amount of total colors) (${input})`
    }
    
    const colorsCorrectCounts = _.reduce(sanityChecks, (res, value, key) => {
      res = res && value === 3
      return res
    }, true)
    
    if (!colorsCorrectCounts) {
      return `Invalid input (incorrect recurrence of colors) (${input})`
    }
    
    // console.log(testProcess(input))

    const neutralized = neutralize(input)
    const normalized = normalize(neutralized)
    
    const possibleSides = {
      fff: 1, ffr: 1, ffb: 1, frr: 1, frb: 1, frf: 1,
      flf: 1, flr: 1, flb: 1, fbf: 1, fbb: 1, fbr: 1
    }
      
    const normalizedSides = getSides(normalized)
    const sidesAreLegal = normalizedSides.reduce((res, val) => {
      res = res && (possibleSides[val] != null)
      return res
    }, true)
    
    if (!sidesAreLegal) {
      return `Invalid input (illegal sides) (${input})`
    }

    const qs = getQuartets(neutralized)
    // const sTemp = qs.map(v => getStats(v, 3))
    // const pTemp = qs.map(v => getStats(v, 6))
    // const qTemp = qs.map(v => getStats(v, 12))
    
    const resul = {
      id: name,
    //   neutralized: {
    //     sides: getSides(neutralized),
    //     pairs: getPairs(neutralized),
    //     quartets: getQuartets(neutralized)
    //   },
    //   normalized: {
    //     sides: getSides(normalized),
    //     pairs: getPairs(normalized),
    //     quartets: getQuartets(normalized)
    //   },
      sides: qs.map(v => getStats(normalize(v), 3)),
      pairs: qs.map(v => getStats(normalize(v), 6)),
      quartets: qs.map(v => getStats(normalize(v), 12)),
    }
    // console.log('result ', resul)
    
    // Since we have reached this state, we have at least what seems to be a legal input
    // But it could still be illegal in the sence that this particular order of sides does not
    // exist in reality (see fx the Impossible input: ['G', 'G', 'G', 'O', 'R', 'O', 'B', 'B', 'B', 'R', 'O', 'r'])
    // But this is something that will be taken into account at a later stage
    return resul
  }
  
  
  
// const UaInput = ['G', 'G', 'G', 'O', 'B', 'O', 'B', 'R', 'B', 'R', 'O', 'r'].join('')
// //const Ua = ['G', 'G', 'G', 'R', 'B', 'R', 'B', 'R', 'B', 'R', 'R', 'R']
// const Impossible = ['G', 'G', 'G', 'O', 'R', 'O', 'B', 'B', 'B', 'R', 'O', 'r'].join('')
// const Ua = workSomeMagic('Ua', UaInput)
// //console.log('result from func: ', JSON.stringify(Ua))
// console.log('Ua: ', Ua)

// const patterns = getSidePatterns('rbr')
// console.log(patterns)
  
// console.log(testProcess('rbg'))
// console.log(testProcess('rbgorr'))
// // const pair = 'fbbllr'
// const pair = 'frbllr'
// const p = getSidePairPatterns(pair)
// console.log(pair + ' patterns', p)
// console.log(getPllFromPatterns(p))

const inputs = {
    Aa: 'bbgorbrgrgoo',
    Ab: 'bbrgrgogbroo',
    E: 'obrgrbrgobog',
    Ua: 'gggobobrbror',
    Ub: 'gggorobobrbr',
    H: 'bgbrorgbgoro',
    Z: 'gogogobrbrbr',
    Ja: 'bbbrrgoorggo',
    Jb: 'bbbrggorrgoo',
    T: 'rrgobrgoobgb',
    Rb: 'rgrgrobogobb',
    Ra: 'ggobogorbrbr',
    F: 'bbbrogogrgro',
    Ga: 'rggobrgrobob',
    Gb: 'orbroobgrgbg',
    Gc: 'gbobrgoobrgr',
    Gd: 'rbgoorgrobgb',
    V: 'bogogrgbbrro',
    Na: 'bggorrgbbroo',
    Nb: 'bbgoorggbrro',
    Y: 'ggbroobrgobr'
}

const plls = _.mapValues(inputs, (i,k) => workSomeMagic(k,i))
// const sideCases = _.reduce(plls, (r, v, k) => {
//     v.normalized.sides.map(s => (r[s] || (r[s] = {}))[v.id] = true)
//     return r
// }, {})
// const pairCases = _.reduce(plls, (r, v, k) => {
//     v.normalized.pairs.map(s => r[s] = v.id)
//     return r
// }, {})
// const quartetCases = _.reduce(plls, (r, v, k) => {
//     v.normalized.quartets.map(s => r[s] = v.id)
//     return r
// }, {})


// console.log('plls', plls)
// console.log('sideCases', sideCases)
// console.log('pairCases', pairCases)
// console.log('quartetCases', quartetCases)
function toResult(id, value) { //id, s, size) {
    // const result = {
    //     id,
    //     match: s.slice(0, size),
    //     remainder: s.slice(size, 12),
    //     lightsOn: getLights(s),
    //     solvedOn: getSolvedSide(s),
    // }
    // if (size === 3) {
    //     result.patterns = getSidePatterns(s.slice(0,3))
    // } else if (size === 6) {
    //     const neutralized = deNormalize(s.slice(0,6))
    //     result.patterns = getSidePairPatterns(neutralized)
    // }
    // return result
    const clone = _.cloneDeep(value)
    clone.match = value.id
    clone.id = id
    return clone
}

const q2 = _.reduce(plls, (r, v, k) => {
    v.sides.map(s => (r[s.id] || (r[s.id] = {}))[v.id] = toResult(v.id, s))
    // v.normalized.quartets.map(s => {
    //     if (r[s.slice(0,3)] == null) r[s.slice(0,3)] = {}
    //     r[s.slice(0,3)][v.id] = toResult(v.id, s, 3)
    // })
    return r
}, {})
console.log('sides', q2)
const q3 = _.reduce(plls, (r, v, k) => {
    v.pairs.map(p => r[p.id] = toResult(v.id, p))
    // v.normalized.quartets.map(s => r[s.slice(0,6)] = toResult(v.id, s, 6))
    return r
}, {})
console.log('pairs', q3)
const q4 = _.reduce(plls, (r, v, k) => {
    v.quartets.map(q => r[q.id] = toResult(v.id, q))
    // v.normalized.quartets.map(s => r[s] = toResult(v.id, s, 12))
    return r
}, {})
console.log('quartets', q4)

function toPll(input) {
    const neutralized = neutralize(input, 'Y')
    // rather fix so that we use neutralized in the lookups
    const normalized = normalize(neutralized)
    return q4[normalized]
}

export function getRandomPll() {
    return _.sample(data)


    // const random = _.sample(_.keys(q4))
    // const deNormalized = deNormalize(random)
    // const deNeutralized = deNeutralize(deNormalized, _.sample(['R','G','B','O']), 'Y')
    // // lbrbllfrfrfb GRBRGGOBOBOR returning undefined but should return Ra
    // const pll = toPll(deNeutralized)
    // console.log('random', random, deNormalized, deNeutralized, pll)
    // pll.colored = deNeutralized
    // return pll
}

function cancelSetupMoves(alg, setupMove) {
    let arr = alg.trim().split(' ')
    const first = arr[0].toUpperCase()
    let setup = ''
    switch (first) {
        case 'Y':
        case 'U': {
            if (setupMove === 'U') {
                setup = 'U2'
            } else if (setupMove === 'U2') {
                setup = 'U\''
            } else if (setupMove === 'U\'') {
                setup = ''
            }
            else {
                setup = 'U'
            }
            break
        }

        case 'Y2':
        case 'U2': {
            if (setupMove === 'U') {
                setup = 'U\''
            } else if (setupMove === 'U2') {
                setup = ''
            } else if (setupMove === 'U\'') {
                setup = 'U'
            } else {
                setup = 'U2'
            }
            break
        }

        case 'Y\'':
        case 'U\'': {
            if (setupMove === 'U') {
                setup = ''
            } else if (setupMove === 'U2') {
                setup = 'U'
            } else if (setupMove === 'U\'') {
                setup = 'U2'
            } else {
                setup = 'U\''
            }
            break
        }

        default: {
            return {
                setup: setupMove,
                algorithm: alg.trim(),
            }
        }
    }

    return {
        setup,
        algorithm: arr.slice(1).join(' ').trim(),
    }
}

function getDescription(arr) {
    if (!arr[0] && !arr[1] && !arr[2] && !arr[3]) return 'None'
    if (arr[0] && arr[1] && arr[2] && arr[3]) return 'All'

    let result = []
    if (arr[0]) result.push('Front')
    if (arr[1]) result.push('Right')
    if (arr[2]) result.push('Back')
    if (arr[3]) result.push('Left')
    return result.join(', ')
}

function toLinkVersion(move) {
    const upped = move.toUpperCase()
    switch (upped) {
        case 'X\'':
        case 'Y\'':
        case 'Z\'':
        case 'U\'':
        case 'D\'':
        case 'F\'':
        case 'R\'':
        case 'B\'':
        case 'L\'': {
            return `${move.charAt(0)}-`
        }

        case 'X2\'':
        case 'Y2\'':
        case 'Z2\'':
        case 'U2\'':
        case 'D2\'':
        case 'F2\'':
        case 'R2\'':
        case 'B2\'':
        case 'L2\'': {
            return `${move.charAt(0)}2-`
        }

        default: {
            return move
        }
    }
}

function toAlgLink(alg) {
    return alg.split(' ').map(move => toLinkVersion(move)).join('_')
}

  // Commenting out to pass build
  // eslint-disable-next-line
function getAllPlls() {
    // const bold = {
    //     none: Array(12).fill(false),
    //     // solved: Array(12).fill(true),
    //     // lights: [true, false, true],
    // }
    const algLink = 'https://alg.cubing.net/?alg={alg}&title={title}&stage=PLL&type=alg&view=playback'
    const bold = {
        none: [false, false, false],
        lights: [true, false, true],
        solved: [true, true, true]   
    }
    let result = _.keys(q4).map(v => {
        // eslint-disable-next-line
        const lbase = Array(12).fill(false)
        // eslint-disable-next-line
        let sbase = Array(12).fill(false)    
        const denorm = deNormalize(v)
        const deneut = deNeutralize(denorm, _.sample(['R', 'G', 'B', 'O']))
        const pll = toPll(deneut)
        const patterns = getSidePairPatterns(pll.match.slice(0,6))
        const recognitions = getRecognitions(pll.match.slice(0,6))
        const lights = { description: getDescription(pll.lightsOn) }
        let lb = []
        // let res = []
        lb = lb.concat(pll.lightsOn[0] ? [...bold.lights] : [...bold.none])
        lb = lb.concat(pll.lightsOn[1] ? [...bold.lights] : [...bold.none])
        lb = lb.concat(pll.lightsOn[2] ? [...bold.lights] : [...bold.none])
        lb = lb.concat(pll.lightsOn[3] ? [...bold.lights] : [...bold.none])
        lights.bold = lb
        // switch(pll.lightsOn) {
        //     case 'All': lbase[0] = true; lbase[2] = true; lbase[3] = true; lbase[5] = true; lbase[6] = true; lbase[8] = true; lbase[9] = true; lbase[11] = true; break
        //     case 'Front': lbase[0] = true; lbase[2] = true; break
        //     case 'Right': lbase[3] = true; lbase[5] = true; break
        //     case 'Back': lbase[6] = true; lbase[8] = true; break
        //     case 'Left': lbase[9] = true; lbase[11] = true; break
        //     default: break
        // }
        // lights.bold = res
        const solved = { description: getDescription(pll.solvedOn) }
        let sb = []
        sb = sb.concat(pll.solvedOn[0] ? [...bold.solved] : [...bold.none])
        sb = sb.concat(pll.solvedOn[1] ? [...bold.solved] : [...bold.none])
        sb = sb.concat(pll.solvedOn[2] ? [...bold.solved] : [...bold.none])
        sb = sb.concat(pll.solvedOn[3] ? [...bold.solved] : [...bold.none])
        solved.bold = sb
        // switch(pll.solvedOn) {
        //     case 'All': sbase = sbase.map(v => true); break
        //     case 'Front': sbase[0] = true; sbase[1] = true; sbase[2] = true; break
        //     case 'Right': sbase[3] = true; sbase[4] = true; sbase[5] = true; break
        //     case 'Back': sbase[6] = true; sbase[7] = true; sbase[8] = true; break
        //     case 'Left': sbase[9] = true; sbase[10] = true; sbase[11] = true; break
        //     default: break
        // }
        // solved.bold = [...sbase]
        const algs = { ...all[pll.id] }
        let setupMove
        // console.log(algs.neutral)
        // console.log(normalize(algs.neutral))
        // console.log(normalize(shift(algs.neutral, 3)))
        // console.log(normalize(shift(algs.neutral, 6)))
        // console.log(normalize(shift(algs.neutral, 9)))

        let setup = {
            // v,
            none: v,
            u: normalize(shift(v, 3)),
            u2: normalize(shift(v, 6)),
            uprime: normalize(shift(v, 9)),
        }
        const vv = normalize(algs.neutral)
        if (setup.none === vv) {
            setupMove = ''
        }
        else if (setup.u === vv) {
            setupMove = 'U'
        }
        else if (setup.u2 === vv) {
            setupMove = 'U2'
        }
        else if (setup.uprime === vv) {
            setupMove = 'U\''
        }
        else {
            setupMove = 'WUT???'
        }

        algs.solutions = algs.solutions.map(alg => {
            const newAlg = {}
            const result = cancelSetupMoves(alg.alg, setupMove)
            newAlg.setupMove = result.setup
            newAlg.algorithm = result.algorithm
            newAlg.userCount = alg.count
            newAlg.date = alg.date
            let link = newAlg.algorithm
            if (result.setup !== '') link = `${result.setup} ${link}`
            newAlg.linkified = toAlgLink(link)
            return newAlg
        })

        algs.linkTemplate = algLink.replace('{title}', `${pll.id}-Perm`)

        // if (normalize(algs.neutral) === v) setupMove = ''
        // else if (normalize(shift(algs.neutral, 3)) === v) setupMove = 'U'
        // else if (normalize(shift(algs.neutral, 6)) === v) setupMove = 'U2'
        // else if (normalize(shift(algs.neutral, 9)) === v) setupMove = 'U\''
        // else setupMove = 'WUT???'
        setup.move = setupMove
        // algs.setupMove = setupMove
        return {
                id: denorm.slice(0, 6),
                pll: pll.id,
                normalized: v,//pll.match.slice(0, 6),
                neutralized: denorm,//.slice(0, 6),
                lights,
                solved,
                recognitions,
                patterns,
                algs,
                // what about remainder...
        }
    })

    result = _.mapKeys(result, 'id')

    // result = data // JSON.parse(data)

    console.log('===============================')
    console.log(result)
    console.log('===============================')
    console.log(JSON.stringify(result))
}

function testing(pll, input) {
    const n = normalize(neutralize(input))
    console.log(pll + ' (side)', q2[n.slice(0,3)])
    console.log(pll + ' (pair)', q3[n.slice(0,6)])
    console.log(pll, q4[n])
}

console.log(testing('F', 'gbobogogbrrr'))
getRandomPll()

// Ra: OBOBORGRBRGG
console.log('recognition (Ra) frfflrflbfrr', getRecognitions('frfflrflbfrr'), getSidePairPatterns('frfflrflbfrr'))

// getAllPlls()