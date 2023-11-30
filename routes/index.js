import express from 'express';
import controller from '../controller/index.js';

const router = express.Router();

router.get('/google_scholar', controller.google_scholarAPI);
router.get('/ieee', controller.ieeeAPI);
router.get('/springer', controller.springerAPI);
router.get('/arxiv', controller.arxivAPI);

module.exports = router;
