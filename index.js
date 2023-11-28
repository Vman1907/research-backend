import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import xml2js from 'xml2js';
var parseString = xml2js.parseString;

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const Validator = (data) => {
    if (data.search === '' || data.search === undefined) {
        return 'Search field is empty';
    }
    if (data.page_no === '' || data.page_no === undefined) {
        return 'Page no is empty';
    }
    if (data.from_year > data.to_year) {
        return 'Invalid year range';
    }
    return null;
};

app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/google_scholar', async (req, res) => {
    const { from_year, to_year, page_no, search } = req.body;
    if (Validator(req.body)) {
        res.send({
            error: Validator(req.body),
        });
        return;
    }
    const params = {
        q: search,
        api_key: process.env.SERP,
        as_ylo: from_year ? from_year : undefined,
        as_yhi: to_year ? to_year : undefined,
        start: page_no ? (page_no - 1) * 10 : undefined,
    };
    try {
        const data = await axios.get(
            'https://serpapi.com/search?engine=google_scholar',
            {
                params: params,
            }
        );
        res.send(data.data.organic_results);
    } catch (err) {
        console.log(err.response);
        res.send({
            error: 'Internal Server Error',
        });
    }
});

app.post('/ieee', async (req, res) => {
    const { from_year, to_year, page_no, search } = req.body;
    const params = {
        article_title: search,
        apikey: process.env.ieee_api_key,
        start_year: from_year ? from_year : undefined,
        end_year: to_year ? to_year : undefined,
        start_record: page_no
            ? page_no === 1
                ? 1
                : (page_no - 1) * 10
            : undefined,
        max_records: 10,
        format: 'json',
        sort_order: 'asc',
        sort_field: 'article_number',
        open_access: 'True',
    };
    if (Validator(req.body)) {
        console.log(err.response);

        res.send({
            error: Validator(req.body),
        });
        return;
    }
    try {
        const data = await axios.get(
            'https://ieeexploreapi.ieee.org/api/v1/search/articles',
            {
                params: params,
            }
        );
        res.send(data.data.articles);
    } catch (err) {
        console.log(err.response);
        res.send({
            error: 'Internal Server Error',
        });
    }
});

app.post('/springer', async (req, res) => {
    const { from_year, to_year, page_no, search } = req.body;
    if (Validator(req.body)) {
        res.send({
            error: Validator(req.body),
        });
        return;
    }
    try {
        const data = await axios.get(
            `http://api.springernature.com/meta/v2/json?q=${search} openaccess:true ${
                from_year ? `onlinedatefrom:${from_year}-01-01%20` : ''
            } ${to_year ? ` onlinedateto:${to_year}-01-01` : ''}&api_key=${
                process.env.springer_api_key
            }&s=${
                page_no
                    ? page_no === 1
                        ? 1
                        : (page_no - 1) * 10 + 1
                    : undefined
            }&p=10`
        );
        res.send(data.data.records);
    } catch (err) {
        console.log(err.response);
        res.send({
            error: 'Internal Server Error',
        });
    }
});

app.post('/arxiv/', async (req, res) => {
    const { search, page_no } = req.body;
    const params = {
        search_query: search,
        start: page_no ? (page_no - 1) * 10 : undefined,
        search_type: 'pdf',
    };
    if (Validator(req.body)) {
        res.send({
            error: Validator(req.body),
        });
        return;
    }
    try {
        const data = await axios.get('http://export.arxiv.org/api/query?', {
            params: params,
        });
        parseString(data.data, function (err, result) {
            if (err) {
                console.log(err);
                res.send({
                    error: 'Internal server error',
                });
                return;
            }
            res.send(result['feed']['entry']);
        });
    } catch (err) {
        console.log(err.response);
        res.send({
            error: 'Internal Server Error',
        });
    }
});

app.post('/elsiever', async (req, res) => {
    const { search, page_no, from_year, to_year } = req.body;
    if (Validator(req.body)) {
        res.send({
            error: Validator(req.body),
        });
        return;
    }
    const params = {
        query: search,
        apiKey: process.env.elsiever_api_key,
        start: page_no ? (page_no - 1) * 10 : undefined,
        count: 10,
        date: from_year ? `${from_year}-${to_year}` : undefined,
    };
    try {
        const data = await axios.get(
            `http://api.elsevier.com/content/search/scopus?`,
            {
                params: params,
            }
        );
        res.send(data.data['search-results']['entry']);
    } catch (err) {
        console.log(err.response);
        res.send({
            error: 'Internal Server Error',
        });
    }
});

app.listen(8000, () => {
    console.log('Example app listening on port 8000!');
});
