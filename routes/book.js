const express = require('express');
const router = express.Router({mergeParams: true});
const driver = require('../config/neo4jDriver');
//error = res.status.send
//ok = res.json
//na wyklanie Miotka sie upewnimy
//na razie olac errory

router.get('/', async (req, res) => {
    const session = driver.session();
    const readTxResultPromise = session.executeRead(txc => {
        return txc.run('MATCH (book:Book) RETURN book')
    })

    readTxResultPromise
        .then(result => {
            console.log(result.records)
        })
        .catch(error => {
            console.log(error)
        })
        .then(() => session.close())
});

router.get('/', async (req, res) => {
    const session = driver.session()
    const titles = []
    try {
        const result = await session.executeRead(tx =>
            tx.run('MATCH (p:Product) WHERE p.id = $id RETURN p.title', { id: 0 })
        )

        const records = result.records
        for (let i = 0; i < records.length; i++) {
            const title = records[i].get(0)
            titles.push(title)
        }
    } finally {
        await session.close()
    }
});


router.post('/', async (req, res) => {
    const name = req.body.name
    const age = req.body.age
    const company = req.body.company
    let newActor = {}

    const session = driver.session();
    session
        .run('MERGE (a:Actor {name : $name, age : $age, company : $company}) RETURN a',
            {"name": name, "age": age, "company": company})
        .subscribe({
            onKeys: keys => {
                console.log(keys)
            },
            onNext: record => {
                newActor = record.get('a')
                console.log(newActor)
            },
            onCompleted: () => {
                session.close();
                return res.send(newActor);
            },
            onError: error => {
                console.log(error)
            }
        })
});