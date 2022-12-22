import { nanoid } from 'nanoid'

export async function postUrl(req, res){
    try{
        const { authorization } = req.headers;
        const token = authorization.replace('Bearer ', '');

        const sessionExists = await connectionDB.query(
            'SELECT * FROM sessions WHERE token=$1;',
            [token]
        );
        
        const {userId} = sessionExists

        const {url} = req.body;
        const shortUrl = nanoid(8);
        await connectionDB.query('INSERT INTO urls ("shortUrl", "url", "visitCount", "userId") VALUES ($1, $2, $3, $4);',
        [shortUrl, url, 0, userId]
        );
        const data = {shortUrl};
        res.status(201).send(data);
    } catch (err){
        res.status(500).send(err.message);
    }
}

export async function getUrlById(req, res){
    const {id} = req.params;
    try{
        const {rows} = await connectionDB.query(
            'SELECT * FROM urls WHERE id=$1;',
            [id]
        );
        //delete rows.visitCount
        res.status(200).send(rows);
    } catch (err){
        res.status(500).send(err.message);
    }
}

export async function openUrl(req, res){
    const {shortUrl} = req.params;
    try{
        const {rows} = await connectionDB.query(
            'SELECT * FROM urls WHERE shortUrl=$1;',
            [shortUrl]
        );
        const newNumber = rows.shortUrl +1

        await connectionDB.query('UPDATE urls SET "visitCount"=$1 WHERE "shortUrl"=$2;',
        [newNumber, shortUrl],
        );

        const url = `/urls/open/${shortUrl}`
        res.redirect(url);
    } catch (err){
        res.status(500).send(err.message);
    }
}