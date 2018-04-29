const fs = require('fs')
const {
    __,
    complement,
    contains,
    splitAt,
    find,
    flatten,
    forEachObjIndexed,
    indexBy,
    is,
    map,
    pluck,
    prop,
    split
} = require('ramda')

fs.readFile('./tests/exploracao_lunar.input', 'utf-8', (err, content) => {
    const tests = split('\n \n', content)

    tests.forEach(test => {
        const [size, ...body] = split('\n', test)
        const [matrix, entries] = splitAt(size, body)

        const lines = map(toVertex, matrix)
        const names = pluck('name', lines)
        const vertices = indexBy(prop('name'), lines)

        forEachObjIndexed(vertex => {
            vertex.edges = vertex.edges.map(edge => vertices[names[edge]])
        }, vertices)

        entries.forEach(entry => {
            const [left, right] = split(' ', entry)
            forEachObjIndexed(vertex => vertex.refcount = 0, vertices)

            if (contains('GOOD_BOY', flatten(hasLink(vertices[left], vertices[right])))) {
                process.stdout.write('* ')
            } else {
                process.stdout.write('! ')
            }
        })

        process.stdout.write('\n')
    })
})

function toVertex(line) {
    const paths = split(' ', line)
    const name = find(complement(contains(__, ['.', '*'])), paths)
    const edges = paths
        .map((value, index) => value === '.' && index)
        .filter(is(Number))

    return { name, edges, refcount: 0 }
}

function hasLink(source, target) {
    const isDirectLink = (source, target) => {
        if (!source || !target) {
            return ['FUI_TAPEADO']
        }

        if (source.refcount > 1) {
            return ['CYCLIC']
        }

        return source.edges.map(edge => {
            edge.refcount++
            if (edge === target) {
                return ['GOOD_BOY']
            }

            return isDirectLink(edge, target)
        })
    }

    return isDirectLink(source, target)
}
