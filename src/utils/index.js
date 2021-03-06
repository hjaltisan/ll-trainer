import _ from 'lodash'

// Edges only pll (EPLL)
export const Epll = {
    simple: ['U', 'H', 'Z'],
    detailed: ['Ua', 'Ub', 'H', 'Z']
}

// Corners only pll (CPLL)
export const Cpll = {
    simple: ['A', 'E'],
    detailed: ['Aa', 'Ab', 'E']
}

// Two adjacent corners + 2 edges
export const AdjacentPll = {
    simple: ['J', 'T', 'R', 'F'],
    detailed: ['Ja', 'Jb', 'T', 'Ra', 'Rb', 'F']
}

// Two diagonal corners + 2 edges
export const DiagonalPll = {
    simple: ['V', 'N', 'Y'],
    detailed: ['V', 'Na', 'Nb', 'Y']
}

// Cycling three corners and three edges
export const CyclingPll = {
    simple: ['G'],
    detailed: ['Ga', 'Gb', 'Gc', 'Gd']
}


// Corners have only 2 colors:
//  - this tells me that all corners are correct / that is there are at least lights on every side, could be a 3-bar but at least lights
//  - This is a EPLL case since all corners are solved (EPLL = U|H|Z)
// Corners have 3 colors:
//  - Somewhere on the cube, on exactly one side there is a light or a 3-bar, and only on one side
//  - This is therefore not an EPLL and not V|Y|N since those have diagonal corners
//  - Hence this is one of A|R|G|T|F|J
// Corners have 4 colors
//  - this tells me that we have a diagonal corner swap, thus no lights anywhere, and no 3-bar anywhere either
//  - Hence this is one of E|Y|V|N
const getCasesByCornerColorCount = (count, detailed = false) => {
    switch (count) {
        case 2: {
            if (detailed) return Epll.detailed
            return Epll.simple
            // U|H|Z
        }
        case 3: {
            if (detailed) return ['Aa', 'Ab', ...AdjacentPll.detailed, ...CyclingPll.detailed]
            return ['A', ...AdjacentPll.simple, ...CyclingPll.simple]
            // A|R|G|T|F|J
        }
        case 4: {
            if (detailed) return ['E', ...DiagonalPll.detailed]
            return ['E', ...DiagonalPll.simple]
            // E|Y|V|N
        }
    }
    return []
}

const getCasesByEdgeRelations = (edgeRel, detailed = false) => {
    if (edgeRel === edgeRelations.Solved) {
        if (detailed) {
            return [
                ...Cpll.detailed,
                ...CyclingPll.detailed,
                'Ua', 'Ub', 'H',
                'Ja', 'Jb', 'Ra', 'Rb',
                'V', 'Y']
        }

        return [
            ...Cpll.simple,
            ...CyclingPll.simple,
            'U', 'H',
            'J', 'R',
            'V', 'Y']
    } else if (edgeRel === edgeRelations.Reversed) {
        if (detailed) {
            return [
                'Ua', 'Ub',
                'Z',
                ...AdjacentPll.detailed,
                ...CyclingPll.detailed,
                ...DiagonalPll.detailed]
        }
        return [
            'U',
            'Z',
            ...AdjacentPll.simple,
            ...CyclingPll.simple,
            ...DiagonalPll.simple]
    } else if (edgeRel === edgeRelations.Opposite) {
        if (detailed) {
            return [
                'Ua', 'Ub',
                'Ja', 'Jb', 'Ra', 'Rb',
                ...CyclingPll.detailed,
                'V', 'Y']
        }
        return [
            'U',
            'J', 'R',
            ...CyclingPll.simple,
            'V', 'Y']
    }
}

const getCasesByCornerColorCountAndEdgeRelations = (count, edgeRel, detailed = false) => {
    const cornerCases = getCasesByCornerColorCount(count, detailed)
    const edgeCases = getCasesByEdgeRelations(edgeRel, detailed)
    return _.intersection(cornerCases, edgeCases)
}

// Corners only have 2 colors:l
//  - Bar on all sides
// Corners have 3 colors:
//  - Bar on opposite side to the side that has opposite corners
// Corners have 4 colors:
//  - No bar anywhere
// fl, fr, rf, rb => oneOf('F', 'R', 'B', 'L')
const getBarLocationsByCornerColors = (fl, fr, rf, rb) => {
    // All corners solved => bar on all sides
    if (fl === fr && rf === rb) return ['F', 'R', 'B', 'L']

    // Bar only on front
    if (fl === fr) return ['F']

    // Bar only on right
    if (rf === rb) return ['R']

    // 4 colors => no bar
    if (fl !== rf && fl !== rb && fr !== rf && fr !== rb) {
        return []
    }

    const colors = { 'F': 1, 'R': 2, 'B': 3, 'L': 4 }

    // Opposite colors on front
    if (colors[fl] % 2 === colors[fr] % 2) return ['B']

    if (colors[rf] % 2 === colors[rb] % 2) return ['L']

    throw 'This should not be possible'
}

const areAdjacent = (color1, color2) => {
    const colors = { 'F': 1, 'R': 2, 'B': 3, 'L': 4 }
    return colors[color1] % 2 !== colors[color2] % 2
}

export const getPllFromColors = (fl, fc, fr, rf, rc, rb) => {
    const colors = { 'F': 1, 'R': 2, 'B': 3, 'L': 4 }

    // Good to use this to calculate all the pll cases given a set of colors
    // But for production it is probably faster to have a dictionary with
    // all 84 possibilites, but I can use this function to generate the
    // dictionary
    const patterns = getPatternsFromColors(fl, fc, fr, rf, rc, rb)

    // If solved
    if (patterns.frontSide.solved && patterns.rightSide.solved) {
        return {
            pll: '',
            lightsOn: 'All',
            solvedOn: 'All',
            patterns,
        }
    }

    // One side solved
    if (patterns.frontSide.solved || patterns.rightSide.solved) {
        // Front side
        if (patterns.frontSide.solved) {
            // Lights
            if (patterns.rightSide.lights) {
                return {
                    pll: areAdjacent(patterns.rightSide.color1, patterns.rightSide.color2) ? 'Ua' : 'Ub',
                    lightsOn: patterns.caseData.lightsOn,
                    solvedOn: 'Front',
                    patterns,
                }
            }
            // 2-Bar
            if (patterns.rightSide.innerBar) {
                return {
                    pll: 'Ja',
                    lightsOn: patterns.caseData.lightsOn,
                    solvedOn: 'Front',
                    patterns,
                }
            } else if (patterns.rightSide.outerBar) {
                return {
                    pll: 'Jb',
                    lightsOn: patterns.caseData.lightsOn,
                    solvedOn: 'Front',
                    patterns,
                }
            }
        }
        // Right side
        if (patterns.rightSide.solved) {
            // Lights
            if (patterns.frontSide.lights) {
                return {
                    pll: areAdjacent(patterns.frontSide.color1, patterns.frontSide.color2) ? 'Ub' : 'Ua',
                    lightsOn: patterns.caseData.lightsOn,
                    solvedOn: 'Right',
                    patterns,
                }
            }
            // 2-Bar
            if (patterns.frontSide.innerBar) {
                return {
                    pll: 'Jb',
                    lightsOn: patterns.caseData.lightsOn,
                    solvedOn: 'Right',
                    patterns,
                }
            } else if (patterns.frontSide.outerBar) {
                return {
                    pll: 'Ja',
                    lightsOn: patterns.caseData.lightsOn,
                    solvedOn: 'Right',
                    patterns,
                }
            }
        }
        // F
        return {
            pll: 'F',
            lightsOn: patterns.caseData.lightsOn,
            solvedOn: patterns.frontSide.solved ? 'Front' : 'Right',
            patterns,
        }
    }

    // Lights on both sides
    if (patterns.frontSide.lights && patterns.rightSide.lights) {
        
        // Checkerboard
        if (patterns.checkers.checkerBoard) {
            return {
                pll: 'Z',
                lightsOn: patterns.caseData.lightsOn,
                solvedOn: 'None',
                patterns,
            }
        }

        // 3 colors and a 2:1 pattern
        if (patterns.colorCount.total === 3) {
            // Going left
            if (fc === rf) {
                return {
                    pll: 'Ua',
                    lightsOn: patterns.caseData.lightsOn,
                    solvedOn: areAdjacent(rc, rb) ? 'Left' : 'Back',
                    patterns,
                }
            // Going right
            } else if (fr === rc) {
                return {
                    pll: 'Ub',
                    lightsOn: patterns.caseData.lightsOn,
                    solvedOn: areAdjacent(fc, fr) ? 'Back' : 'Left',
                    patterns,
                }
            }
        }

        // 4 colors and both lights contain adjacent
        if (patterns.colorCount.total === 4 && areAdjacent(fr, fc) && areAdjacent(rf, rc)) {
            return {
                pll: 'Z',
                lightsOn: patterns.caseData.lightsOn,
                solvedOn: 'None',
                patterns,
            }
        }

        // 4 colors and both lights contain opposite
        if (patterns.colorCount.total === 4 && !areAdjacent(fr, fc) && !areAdjacent(rf, rc)) {
            return {
                pll: 'Z',
                lightsOn: patterns.caseData.lightsOn,
                solvedOn: 'None',
                patterns,
            }
        }
    }

    // Lights on front + bar on right
    if (patterns.frontSide.lights && (patterns.rightSide.innerBar || patterns.rightSide.outerBar)) {

        // Inside bar & 3 colors
        if (patterns.colorCount.total === 3 && patterns.rightSide.innerBar) {
            return {
                pll: 'T',
                lightsOn: patterns.caseData.lightsOn,
                solvedOn: 'None',
                patterns,
            }
        }

        // Inside bar & 4 colors
        if (patterns.colorCount.total === 4 && patterns.rightSide.innerBar) {
            return {
                pll: 'Ra',
                lightsOn: patterns.caseData.lightsOn,
                solvedOn: 'None',
                patterns,
            }
        }

        // Outside bar & 3 colors
        if (patterns.colorCount.total === 3 && patterns.rightSide.outerBar) {
            return {
                pll: 'Aa',
                
            }
        }

        // Outside bar & 4 colors
        if (patterns.colorCount.total === 4 && patterns.rightSide.outerBar) {
            // Ga / Gc
        }
    }

    return patterns

    // if 3bar
    if (patterns.threeBar.count === 1) {
        // If headlights (U)
        //   if threebar left => Ua (headlights contain adjacent) threebar: front | Ub (headlights contain opposite) threebar: right
        //   Ua (headlights contain opposite) threebar: right | Ub (headlights contain adjacent) threebar: right
        // If twobar (J)
        //   if bar left => Ja (twobar inner) bar: front | Jb (twobar outer) bar: front
        //   Ja (twobar outer) bar: right | Jb (twobar inner) bar: front
        // F bar: (threebar left ? front : right)
        if (patterns.headligths.count === 1) {
            if (patterns.threeBar.left) {
                if (patterns.headligths.right.adjacent) {
                    return { case: 'U', subCase: 'Ua', bar: 'front' }
                } else {
                    return { case: 'U', subCase: 'Ub', bar: 'front' }
                }
            } else {
                if (patterns.headligths.left.adjacent) {
                    return { case: 'U', subCase: 'Ub', bar: 'right' }
                } else {
                    return { case: 'U', subCase: 'Ua', bar: 'right' }
                }
            }
        }
        if (patterns.twoBar.count === 1) {
            if (patterns.threeBar.left) {
                if (patterns.twoBar.right.outer) {
                    return { case: 'J', subCase: 'Jb', bar: 'front' }
                } else {
                    return { case: 'J', subCase: 'Ja', bar: 'front' }
                }
            } else {
                if (patterns.twoBar.left.outer) {
                    return { case: 'J', subCase: 'Ja', bar: 'right' }
                } else {
                    return { case: 'J', subCase: 'Jb', bar: 'right' }
                }
            }
        }
        return { case: 'F', bar: patterns.threeBar.left ? 'front' : 'right' }
    }

    // if 2 lights
    if (patterns.headligths.count === 2) {
        // if 2-color 6-checker => Z
        // if 2:1 pattern (and 3 colors) (U)
        //   if left => Ub bar: (left lights adjacent ? back : left)
        //   Ua bar: (right lights adjacent ? left : back)
        // if lights contain adjacent (and 4 colors) => Z
        // (lights contain opposite (and 4 colors)) => H 
        if (patterns.checkers.size === 6) {
            return { case: 'Z', bar: 'none' }
        }
        if (patterns.checkers.left.half) {
            let bar
            if (patterns.headligths.left.adjacent) {
                bar = 'back'
            } else {
                bar = 'left'
            }
            return { case: 'U', subCase: 'Ub', bar }
        }
        if (patterns.checkers.right.half) {
            let bar
            if (patterns.headligths.right.adjacent) {
                bar = 'left'
            } else {
                bar = 'back'
            }
            return { case: 'U', subCase: 'Ua', bar }
        }
        if (patterns.headligths.left.adjacent) {
            return { case: 'Z', bar: 'none' }
        }
        if (!patterns.headligths.left.adjacent) {
            return { case: 'H', bar: 'none' }
        }
    }

    // if lights + 2bar
    if (patterns.headligths.count === 1 && patterns.twoBar.count === 1) {
        // if bar inside
        //   if 3 colors => T lights: (lights left ? front : right)
        //   (4 colors) Ra (lights left) lights: front | Rb (lights right) lights: right
        // (outer bar)
        //   if 3 colors => Aa (lights left) lights: front | Ab (lights right) lights: right
        //   (4 colors) Ga (lights left) lights: front | Gc (lights right) lights: right
        if (patterns.headligths.left.has) {
            if (patterns.twoBar.right.inner) {
                if (patterns.colorCount.total === 3) {
                    return { case: 'T', lights: 'front' }
                }
                return { case: 'R', subCase: 'Ra', lights: 'front' }
            } else {
                if (patterns.colorCount.total === 3) {
                    return { case: 'A', subCase: 'Aa', lights: 'front' }
                }
                return { case: 'G', subCase: 'Ga', lights: 'front' }
            }
        } else {
            if (patterns.twoBar.left.inner) {
                if (patterns.colorCount.total === 3) {
                    return { case: 'T', lights: 'right' }
                }
                return { case: 'R', subCase: 'Rb', lights: 'right' }
            } else {
                if (patterns.colorCount.total === 3) {
                    return { case: 'A', subCase: 'Ab', lights: 'right' }
                }
                return { case: 'G', subCase: 'Gc', lights: 'right' }
            }
        }
    }

    // if lone lights
    if (patterns.headligths.count === 1) {
        // if checker === 5 => Ra (right) lights: right | Rb (left) lights: front
        // if checker === 4 => Ga (right) lights: right | Gc (left) lights: front
        // if lights opposite => Gb (left) lights: front | Gd (right) lights: right
        // => Aa (right) lights: right | Ab (left) lights: front (checkers.half)
    }

    // if double twobars
    if (patterns.twoBar.count === 2) {
        // If both on outside => Y
        // Both inside
        //  bookends => Aa (opposite on right) lights: back | Ab (opposite on left) lights left
        //  V
        // (one outside && one inside)
        //  bookends => Ja (twobar on left is outside) threebar: left | Jb (twobar on right is outside) threebar: back
        //  Na (twobar on right is outside) | Nb (twobar on left is outside)
    }

    // If twobar on outside
    {
        // If no bookends => V
        // if next to bookend and twobar is same color (3 colors)
        //   if same color is adjacent to twobar (or bookends)
        //     => Ra (bar on left) lights: left | Rb (bar on right) lights: back
        //   if opposite to twobar (or bookends)
        //     => Gb (twobar on right) lights: left | Gd (twobar on left) lights: back
        // (4 colors)
        //   if (next to twobar is adjacent) => T lights: (twobar on left ? left : back)
        //   (next is opposite)
        //     => Aa (twobar on left) lights: back | Ab (twobar on right) lights: left
    }

    // If twobar on inside
    {
        // if no bookends => Y
        // if (bookends|next to twobar adjacent to twobar)
        //   => Ga (twobar on left) lights: left | Gc (twobar on right) lights: back
        // (opposite to twobar)
        //   => Gb (twobar on left) lights: back | Gd (twobar on right) lights: left
    }

    // if bookends
    if (patterns.bookends) {
        // if inner 4 checker => F bar: ()
        // if adj to bookends appears twice (outside color in checker)
        //   => Ra (inner 3 checker on left) lights: back | Rb (inner 3 checker on right) lights: left
        // (opposite to bookends appears twice (outside color in checker))
        //   => Ga (inner 3 checker on right) lights: back | Gc (inner 3 checker on left) lights: left
    }

    // if no bookends
    if (!patterns.bookends) {
        // if inner 4 checker => V
        // if outer checker => Y
        // (5 checker with opposite middle) => E
    }

    return patterns
}

const cubeColors = Object.freeze({
    Front: 1,
    Left: 2,
    Back: 3,
    Right: 4,
})

const cornerStatus = Object.freeze({
    Solved: 1,
    Adjacent: 2,
    Diagonal: 3,
})

const edgeRelations = Object.freeze({
    Solved: 1,
    Reversed: 2,
    Opposite: 3,
})

const colorRelation = Object.freeze({
    Adjacent: 1,
    Opposite: 2,
    Same: 3,
})

const twoBarPosition = Object.freeze({
    Inner: 1,
    Outer: 2,
})

const getPatternsFromColors = (fl, fc, fr, rf, rc, rb) => {
    const colors = Object.freeze({ 'F': 1, 'R': 2, 'B': 3, 'L': 4 })

    const frontSide = {
        solved: false,
        innerBar: false,
        outerBar: false,
        lights: false,
        color1: '',
        color2: '',
        color3: '',
    }

    const rightSide = {
        solved: false,
        innerBar: false,
        outerBar: false,
        lights: false,
        color1: '',
        color2: '',
        color3: '',
    }

    let bookends = false

    const checkers = {
        outer: false,
        inner: false,
        checkerBoard: false,
        fromFront: {
            checker: 0,
            oddChecker: false,
            middleChecker: false,
        },
        fromRight: {
            checker: 0,
            oddChecker: false,
            middleChecker: false,
        },
    }
    
    const colorCount = {
        total: 0,
        corners: 0,
        sides: 2,
    }

    const caseData = {
        cornerStatus: {},
        lightsOn: '',
        edgesRelations: {},
        possibleCases: [],
        input: [],
    }

    frontSide.solved = fl === fc && fl === fr
    frontSide.innerBar = !frontSide.solved && fc === fr
    frontSide.outerBar = !frontSide.solved && fl === fc
    frontSide.lights = !frontSide.solved && fl === fr
    if (frontSide.solved) frontSide.color1 = fl
    if (frontSide.innerBar) {
        frontSide.color1 = fc
        frontSide.color2 = fl
    }
    if (frontSide.outerBar) {
        frontSide.color1 = fc
        frontSide.color2 = fr
    }
    if (frontSide.lights) {
        frontSide.color1 = fl
        frontSide.color2 = fc
    }
    if (frontSide.color1 === '') {
        frontSide.color1 = fl
        frontSide.color2 = fc
        frontSide.color3 = fr
    }

    rightSide.solved = rf === rc && rf === rb
    rightSide.innerBar = !rightSide.solved && rc === rf
    rightSide.outerBar = !rightSide.solved && rb === rc
    rightSide.lights = !rightSide.solved && rf === rb
    if (rightSide.solved) rightSide.color1 = rf
    if (rightSide.innerBar) {
        rightSide.color1 = rc
        rightSide.color2 = rb
    }
    if (rightSide.outerBar) {
        rightSide.color1 = rc
        rightSide.color2 = rf
    }
    if (rightSide.lights) {
        rightSide.color1 = rf
        rightSide.color2 = rc
    }
    if (rightSide.color1 === '') {
        rightSide.color1 = rf
        rightSide.color2 = rc
        rightSide.color3 = rb
    }

    let counter = { F: 0, L: 0, R: 0, B: 0 }

    counter[fl] = 1
    counter[fr] = 1
    counter[rf] = 1
    counter[rb] = 1

    colorCount.corners = _.sum(_.values(counter))

    counter[fc] = 1
    counter[rc] = 1

    colorCount.total = _.sum(_.values(counter))

    bookends = fl === rb
    checkers.checkerBoard = fl === fr && fl === rc && fc === rf && fc === rb
    checkers.outer = !checkers.checkerBoard && fl === rc && fc === rb
    
    if (!checkers.checkerBoard && !checkers.outer) {
        if (fl === fr && fc === rf) {
            checkers.fromFront.checker = 4
            if (fl === rc) {
                checkers.fromFront.checker += 1
            }
        } else if (rb === rf && rc === fr) {
            checkers.fromRight.checker = 4
            if (rb === fc) {
                checkers.fromRight.checker += 1
            }
        } else if (fc === rf && fr === rc) {
            checkers.inner = true
        } else if (frontSide.lights && fl === rc) {
            checkers.fromFront.oddChecker = true
        } else if (rightSide.lights && rf === fc) {
            checkers.fromRight.oddChecker = true
        } else if (fl === rc && fl !== fr && fl % 2 === fr % 2 && fc === rf) {
            checkers.fromFront.middleChecker = true
        } else if (rb === fc && rb !== rf && rb % 2 === rf % 2 && rc === fr) {
            checkers.fromRight.middleChecker = true
        } else if (fc === rf) {
            checkers.fromFront.checker = 3
        } else if (rc === fr) {
            checkers.fromRight.checker = 3
        }
    }

    if (colorCount.corners === 2) {
        caseData.cornerStatus = cornerStatus.Solved
    } else if (colorCount.corners === 3) {
        caseData.cornerStatus = cornerStatus.Adjacent
    } else {
        caseData.cornerStatus = cornerStatus.Diagonal
    }

    if (caseData.cornerStatus === cornerStatus.Solved) {
        caseData.lightsOn = 'All'
    } else if (caseData.cornerStatus === cornerStatus.Diagonal) {
        caseData.lightsOn = 'None'
    } else {
        if (frontSide.solved || frontSide.light) {
            caseData.lightsOn = 'Front'
        } else if (rightSide.solved || rightSide.light) {
            caseData.lightsOn = 'Right'
        } else if (fl % 2 === fr % 2) {
            caseData.lightsOn = 'Back'
        } else if (rf % 2 === rb % 2) {
            caseData.lightsOn = 'Left'
        }
    }

    caseData.possibleCases = getCasesByCornerColorCount(colorCount.corners, true)

    if (colors[fc] % 2 === colors[rc] % 2) {
        caseData.edgesRelations = edgeRelations.Opposite
    } else if (colors[fc] + 1 === colors[rc]) {
        caseData.edgesRelations = edgeRelations.Solved
    } else if (colors[rc] + 1 === colors[fc]) {
        caseData.edgesRelations = edgeRelations.Reversed
    } else if (colors[fc] === 4 && colors[rc] === 1) {
        caseData.edgesRelations = edgeRelations.Solved
    } else if (colors[rc] === 4 && colors[fc] === 1) {
        caseData.edgesRelations = edgeRelations.Reversed
    }

    caseData.possibleCases =
        getCasesByCornerColorCountAndEdgeRelations(
            colorCount.corners,
            caseData.edgesRelations,
            true)

    caseData.input = [fl, fc, fr, rf, rc, rb]

    return {
        bookends,
        frontSide,
        rightSide,
        colorCount,
        checkers,
        caseData,
    }
}

window.getPatternsFromColors = getPatternsFromColors
window.getCasesByCornerColorCount = getCasesByCornerColorCount
window.getBarLocationsByCornerColors = getBarLocationsByCornerColors
window.getPllFromColors = getPllFromColors
