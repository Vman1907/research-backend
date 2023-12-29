import express from 'express';
import controller from '../controller/index.js';

const router = express.Router();

router.post('/google_scholar', function (req, res) {
    controller.googleAPI(req, res);
});
router.post('/ieee', function (req, res) {
    controller.ieeeAPI(req, res);
});
router.post('/springer', function (req, res) {
    controller.spingerAPI(req, res);
});
router.post('/arxiv', function (req, res) {
    controller.arxivAPI(req, res);
});

export default router;
