const router = require('express').Router();
const axios = require('axios');
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();
const Users = require('../models/Users');

router.get('/uploadResume', async (req, res) => {
    console.log("resume uploaded!");
    const resumePath = encodeURI(req.query.r);
    const ans0 = req.query.ans0;
    const ans1 = req.query.ans1;
    const ans2 = req.query.ans2;
    const ans3 = req.query.ans3;
    
    console.log(ans0, ans1, ans2, ans3, resumePath);

    axios.get(`https://api.ocr.space/parse/imageurl?apikey=${process.env.OCR_API_KEY}&url=${resumePath}`)
        .then(async resp => {
            let resumeText = "";
            resp.data.ParsedResults.forEach(result => {
                resumeText += result.ParsedText;
            });

            let context = `I am working for the ${ans0} industry, am applying for a ${ans2} ${ans1} role. I am most interested in improving on: ${ans3}. No questions asked.`
            // console.log(context);
            const cohere = require('cohere-ai');
            cohere.init(process.env.COHERE_KEY); // This is your trial API key
            (async () => {
            const response = await cohere.generate({
                model: 'command',
                prompt: `${resumeText}\n${context}\nGenerate a list of 5 interview questions based on this resume and the context and provide the output in the following JSON format:\n{\n    \"questions\":[\n            {\n                 \"question\": \""What are your technical strengths and how did you apply them in your projects?"\n            }\n      ]\n}`,
                max_tokens: 740,
                temperature: 1.2,
                k: 0,
                stop_sequences: [],
                return_likelihoods: 'NONE'
            });

            console.log(`Prediction: ${response.body.generations[0].text}`);
            Users.findOne({email: req.session.user.email})
            .then(async (user) => {
                // console.log(user);
                user.questions = await JSON.parse(response.body.generations[0].text);
                user.save()
                .then(() => {
                    console.log("Questions saved!");
                    res.json({
                        success: true,
                    });
                })
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
            })();

        });
})

router.get('/detectFace',async (req, res) => {
    const fileUrl = req.query.f;
    const [result] = await client.faceDetection(`${fileUrl}`);
    const faces = result.faceAnnotations;
    console.log('Faces:');
    faces.forEach((face, i) => {
        console.log(`  Face #${i + 1}:`);
        console.log(`    Joy: ${face.joyLikelihood}`);
        console.log(`    Anger: ${face.angerLikelihood}`);
        console.log(`    Sorrow: ${face.sorrowLikelihood}`);
        console.log(`    Surprise: ${face.surpriseLikelihood}`);
    });
})

module.exports = router;