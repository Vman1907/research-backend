const Validator = (data) => {
    if (data.search === undefined) {
        return 'Search field is empty';
    }
    if (data.page_no === undefined) {
        return 'Page no is empty';
    }
    if (data.from_year < data.to_year) {
        return 'Invalid year range';
    }
    if (data.from_year === undefined) {
        return 'From year is empty';
    }
    return null;
};

export default Validator;
