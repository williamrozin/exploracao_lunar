const fs = require('fs')
// Ramda is a "practical functional library for JavaScript programmers.", http://ramdajs.com/
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

// Reading the input file
fs.readFile('./tests/exploracao_lunar.input', 'utf-8', (err, content) => {
    // getting all test cases
    const tests = split('\n \n', content)

    // for every test case, find possible edges between vertices
    tests.forEach(test => {
        // getting size and body (matrix + entries)
        const [size, ...body] = split('\n', test)

        // getting matrix and entries 
        const [matrix, entries] = splitAt(size, body)

        // for every line of matrix, we create a vertex
        const lines = map(toVertex, matrix)

        // naming the lines, to access them in a O(1)
        const names = pluck('name', lines)

        // getting vertices from lines
        const vertices = indexBy(prop('name'), lines)

        forEachObjIndexed(vertex => {
            // instead of doing an tree, we create a reference of possible links between every vertex
            vertex.edges = vertex.edges.map(edge => vertices[names[edge]])
        }, vertices)

        // for every entry test, we verify if it is valid or not
        entries.forEach(entry => {
            // get the "from" and the "to" entry case
            const [left, right] = split(' ', entry)

            // reset refcount, to guarantee that every case was tested correctly
            forEachObjIndexed(vertex => vertex.refcount = 0, vertices)

            // if there are at leat one 'GOOD_BOY' key, there are a link between this vertices too
            if (contains('GOOD_BOY', flatten(hasLink(vertices[left], vertices[right])))) {
                process.stdout.write('* ')
            } else {
                process.stdout.write('! ')
            }
        })

        process.stdout.write('\n')
    })
})

// function to transform each line of the matrix in a vertex
function toVertex(line) {
    const paths = split(' ', line)
    const name = find(complement(contains(__, ['.', '*'])), paths)
    const edges = paths
        .map((value, index) => value === '.' && index)
        .filter(is(Number))

    // return name, edges and the refcount (used to prevent cyclic loops)
    return { name, edges, refcount: 0 }
}

// recursive function to verify if there is a link (edge) between two vetrices 
function hasLink(source, target) {
    const isDirectLink = (source, target) => {

        // if the source or the edge does not exists in the graph, we stop
        if (!source || !target) {
            return ['FUI_TAPEADO']
        }

        // if the source.refcount is greater then 1, there is a cyclic relationship
        if (source.refcount > 1) {
            return ['CYCLIC']
        }

        return source.edges.map(edge => {
            edge.refcount++

            /* in case of existing a reference of the vertex "edge" in the target,
                we have a link between the soure and the target */
            if (edge === target) {
                return ['GOOD_BOY']
            }

            return isDirectLink(edge, target)
        })
    }

    return isDirectLink(source, target)
}
