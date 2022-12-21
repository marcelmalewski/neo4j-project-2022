const express = require('express')
const router = express.Router({mergeParams: true})
const driver = require('../config/neo4jDriver')
//error = res.status.send
//TODO jaki error status kiedy
//ok = res.json

router.get('/', async (req, res) => {
    const session = driver.session()
    const readTxResultPromise = session.executeRead(txc => {
        return txc.run('MATCH (book:Book) RETURN book')
    })

    readTxResultPromise
        .then(result => {
            res.json(result.records.map(record => record.get("book").properties))
        })
        .catch(error => {
            res.status(400).send(error)
        })
        .then(() => session.close())
});


router.post('/', async (req, res) => {
    const title = req.body.title
    const description = req.body.description
    const releaseDate = req.body.releaseDate
    const imageLink = req.body.imageLink

    const session = driver.session()
    const readTxResultPromise = session.executeWrite(txc => {
        return txc.run(
            'MATCH (book:Book {title: "Harry Potter", description: "Cool book", releaseDate: "Date"}) ' +
            'RETURN book'
        )
    })

    readTxResultPromise
        .then(result => {
            res.json(
                result.records[0].get("book").properties
            )
        })
        .catch(error =>
            res.status(400).send(error)
        ).then(() =>
            session.close()
        )
});

module.exports = router;