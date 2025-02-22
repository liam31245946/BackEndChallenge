import 'dotenv/config';
import pg from 'pg';
import express from 'express';
import { ClientError, errorMiddleware } from './lib/index.js';

type Movie = {
  movieId: number
  title: string,
  summary: string,
  rating: number,
  link: string
}
const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();
app.use(express.json());

// upload new movie 

app.post('/api/movie', async (req, res, next) => {
  try {
    const { title, summary, rating, link } = req.body;

    if (!title) {
      throw new ClientError(400, 'Title is missing');
    }
    if (!summary) {
      throw new ClientError(400, 'Summary is missing');
    }
    if (!rating) {
      throw new ClientError(400, 'Rating is missing');
    }
    if (!link) {
      throw new ClientError(400, 'Link is missing');
    }

    const sql = `
    insert into "Movie" 
    ("title", "summary", "link","rating")
    value($1,$2,$3,$4)
    returning *
    `
    const params = [title, summary,link,rating]
    const result = await db.query(sql,params)
    const createMovie =result.rows[0]
    res.status(201).json(createMovie);

  } catch (err) {
    next(err);
  }
});

// update

app.put('/api/movie/:movieId', async (req,res,next)=>{
  try{
    const {movieId} = req.params
    const {title, summary, link, rating} = req.body

    const update:any[] = []
    const values = []
    values.push(movieId)
    let i = 3

    if (title){
      values.push(movieId);
      values.push(title)
    }
    if (summary){
      values.push(movieId);
      values.push(summary)
    }
    if (link){
      values.push(movieId);
      values.push(link)
    }
    if (rating){
      values.push(movieId);
      values.push(link)
    }

    if ( update.length ===0){
      throw new ClientError(400, 'Please provide what need to be fix')
    }

    const sql = `
    update "Movie"
    set ${update}
    where "movieId" = $1 
    returning *
    `
    const result = await db.query(sql,values)
    const updatedMovie = result.rows[0]
    res.status(200).json(updatedMovie)
  }catch(err){
    next(err)
  }
})

// delete
app.delete('/api/movie/:movieId', async(req,res,next)=>{
  try{
    const {movieId} = req.params
    const sql = `
    delete from "Movie" 
    where "movieId" = $1
    returning *
    `
    const params = [movieId]
    const result = await db.query(sql,params)
    const deleteMovie = result.rows[0]
    res.status(201).json(deleteMovie)

  }catch(err){
    next(err)
  }
})

// get each  movie back
app.get('/api/movie/:movieId', async (req, res,next) => {
  try{
    const {movieId} = req.params

    const sql =  `
    select * 
    from "Movie"
    where "MovieId" = $1
    `
    const params = [movieId]
    const result = await db.query(sql,params)
    const eachMovie = result.rows[0]
    if (!eachMovie) {
      return res.status(404).json({ error: 'eachMovie not found' });
    }
    res.status(200).json(eachMovie)
  } catch(err){
    next(err)
  }
});

// get everything back 
app.get('/api/movie', async (req, res,next) => {
  try{

    const sql =  `
    select * 
    from "Movie"

    `
    const result = await db.query(sql)
    const allMovie = result.rows
    if (!allMovie) {
      return res.status(404).json({ error: 'allhMovie not found' });
    }
    res.status(200).json(allMovie)
  } catch(err){
    next(err)
  }
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});