const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const globby = require('globby')
const fs = require('fs')
const axios = require('axios')
const crypto = require('crypto');

let fileName='';


const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/img'),
        filename: (req, file, cb) => { 
            cb(null, file.originalname); //file.originalname
        } 
})

const fileFilter = (req, file, cb)=>{ 
    //if (file.mimetype.match(/.(jpeg|png|gif)$/)) 
    fileName = file.originalname
    //console.log(file.mimetype)
    if (file.mimetype === 'text/plain') {
        cb(null, true);
    } else{
        cb(null, false); // false, ignore other files
    }
}

const uploadFile = multer({ 
    storage,
    limits: {fileSize: 1000000},
    fileFilter 
})

router.get('/upload', async (req,res)=>{
    const paths = await globby(['**/public/img/*']);
    // console.log(paths);
    const pathsNew = paths.map(function(x){
        return x.replace("public/",'')
    })
    res.send(pathsNew)
    // res.send('En upload')
})

router.post('/upload', uploadFile.single('file'), async (req, res) => {
    //  console.log(req.file);
    res.redirect(303, '/archivoCertificado');
});

router.get('/archivoCertificado',(req,res)=>{
    
    let rutaArchivo = '../public/img/' + fileName
    let filePath = path.join(__dirname, rutaArchivo);
    
    //Sign
    let private_key = fs.readFileSync('./privateKey.pem', 'utf-8')
    let doc = fs.readFileSync(filePath)
    let signer = crypto.createSign('RSA-SHA256');
    signer.write(doc);
    signer.end();
    let signature = signer.sign(private_key, 'base64')
    console.log('Digital Signature: ', signature)

    //Verify
    fs.writeFileSync('./signature.txt', signature)
    let public_key = fs.readFileSync('./publicKey.pem', 'utf-8')
    signature = fs.readFileSync('./signature.txt', 'utf-8');
    let verifier = crypto.createVerify('RSA-SHA256');
    verifier.write(doc);
    verifier.end();
    let result = verifier.verify(public_key, signature, 'base64');
    console.log('Digital Signature Verification : ' + result);

    try{
        if(fs.statSync(filePath).isFile()){
            res.download(filePath)
        }
    }catch(e){
        console.log("Archivo no existente")
    }
})

router.post('/archivosSubidos',(req,res)=>{

    let archivosArreglo;
    axios('https://localhost:3000/upload') // hace una peticion get a upload para obtener el nombre de todos los archivos guardados
        .then(response => {
            
            //Mapear el response.data a un arreglo de objetos para imprimirlo en el html
            archivosArreglo = response.data.map(archivo => {return {nombre: archivo}})            

           // enviar el arreglo al html
            res.render('home',{
                title: "Home",
                condition:false,
                pathsNew : archivosArreglo
            })

        })
});

module.exports = router;