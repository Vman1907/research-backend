import axios from 'axios';
import xml2js from 'xml2js';
var parseString = xml2js.parseString;

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

async function googleAPI(req, res) {
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
        const { data } = await axios.get(
            'https://serpapi.com/search?engine=google_scholar',
            {
                params: params,
            }
        );
        console.log(data.search_information.total_results);
        res.send({
            results: data.organic_results,
            count: data.search_information.total_results,
        });
    } catch (err) {
        console.log(err);
        res.send({
            error: 'Internal Server Error',
        });
    }
}

async function ieeeAPI(req, res) {
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
    };
    if (Validator(req.body)) {
        console.log(err.response);

        res.send({
            error: Validator(req.body),
        });
        return;
    }
    try {
        const { data } = await axios.get(
            'https://ieeexploreapi.ieee.org/api/v1/search/articles',
            {
                params: params,
            }
        );
        res.send({ records: data.articles, count: data.total_records });
    } catch (err) {
        console.log(err.response);
        res.send({
            error: 'Internal Server Error',
        });
    }
}

async function spingerAPI(req, res) {
    const { from_year, to_year, page_no, search } = req.body;
    if (Validator(req.body)) {
        res.send({
            error: Validator(req.body),
        });
        return;
    }
    try {
        const { data } = await axios.get(
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
        res.send({ records: data.records, count: data.result[0].total });
    } catch (err) {
        console.log(err.response);
        res.send({
            error: 'Internal Server Error',
        });
    }
}

async function arxivAPI(req, res) {
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
        const { data } = await axios.get('http://export.arxiv.org/api/query?', {
            params: params,
        });
        parseString(data, function (err, result) {
            if (err) {
                console.log(err);
                res.send({
                    error: 'Internal server error',
                });
                return;
            }
            res.send({
                records: result['feed']['entry'],
                count: result['feed']['opensearch:totalResults'][0]['_'],
            });
        });
    } catch (err) {
        console.log(err.response);
        res.send({
            error: 'Internal Server Error',
        });
    }
}

export default { arxivAPI, googleAPI, ieeeAPI, spingerAPI };
