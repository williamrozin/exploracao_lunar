const fs = require('fs')
const { head, tail, take } = require('ramda')

const outputFile = fs.createWriteStream('exploracao_lunar.output', { 'flags': 'a' });

fs.readFile('./exploracao_lunar.input', 'utf-8', (err, data) => {
    const cases = data.split('\n \n')
    cases.map(processPath)
})


function processPath(data) {
    const size = head(data.split('\n'))
    const path = tail(data.split('\n'))
    const possibilities = path[size]

    // TODO logic

    outputFile.write(possibilities)
    outputFile.write('\n')
}
