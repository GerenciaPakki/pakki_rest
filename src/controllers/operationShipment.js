const { GetViewDocumentsPDF } = require("../helpers/convertToPDF");
const {
    MarcaDeTiempoCol,
    convertirMilisegundosAFecha,
    convertirAFechaEstandar
} = require("../helpers/pakkiDateTime");
const { ShowTokenInComponents } = require("../middleware/globalValidations");
const businessUsers = require("../models/businessUsers");
const shipmentComment = require("../models/shipmentComment");
const shipments = require("../models/shipments");



const getViewshipment = async (req, res = response) => {
    const token = req.header('x-token');
    let {
        brachOffice,
        guideNumber
    } = req.body;

    // const decodedToken = await ShowTokenInComponents(token);
    // const uid = decodedToken.msg.uid;
    // const bus = decodedToken.msg.bus;

    // const userIdObject = new mongoose.Types.ObjectId(business);

    try {
        const query = {};
    
        if (brachOffice) query["business.brachOffice"] = brachOffice;
        if (guideNumber) query["shipment.ShipmentCode"] = guideNumber;
    
        const shipmentDB = await shipments.aggregate([{
                $match: query // Aplicar la misma consulta de filtro
            },
            {
                $project: {
                    "business.business": 1,
                    "business.brachOffice": 1,
                    "business.collaborator": 1,
                    "Destination.cityDestination.cityName": 1,
                    "shipment.ShipmentCode": 1,
                    "shipment.Comments": 1,
                    "shipment.ReasonDescription": 1,
                    "shipment.ShipmentCode": 1,
                    "Provider.partners": 1,
                    "ShipmentID": 1,
                    "dateCreate": {
                        $dateToString: {
                            format: "%d-%m-%Y",
                            date: "$dateCreate"
                        }
                    }
                }
            },
            {
                $sort: {
                    dateCreate: -1 // Ordenar por la fecha en el nuevo formato
                }
            },
            {
                $limit: 40 // Limitar el número de resultados
            }
        ]);

        res.json({
            ok: true,
            msg: shipmentDB
        });
    } catch (error) {
        // Manejar el error según tus necesidades
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error en el servidor',
        });
    }
}


const getViewOneshipment = async (req, res = response) => {
    const token = req.header('x-token');
    const {
        ShipmentID
    } = req.body;

    try {
        const decodedToken = await ShowTokenInComponents(token);
        const uid = decodedToken.msg.uid;
        const bus = decodedToken.msg.bus;

        const ShipmentCommentDB = await shipmentComment.findOne({
            ShipmentID
        })

        res.json({
            ok: true,
            msg: ShipmentCommentDB
        });
    } catch (error) {
        // Manejar el error según tus necesidades
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error en el servidor',
        });
    }
}

const getShipmentComment = async (req, res) => {
    
    const token = req.header('x-token');
    const {
        business,
        Destination,
        shipment,
        Provider,
        ShipmentID,
        dateCreate,
        comment,
        status,
    } = req.body;

    const marcaDeTiempo = MarcaDeTiempoCol()


    try {
        const decodedToken = await ShowTokenInComponents(token);
        const uid = decodedToken.msg.uid;
        const bus = decodedToken.msg.bus;

        const userDB = await businessUsers.findOne({
            _id: uid,
            status: true
        }, {
            "colla.name": 1,
            "colla.lastName": 1,
            _id: 0
        });
        
        const Shipment = {
            ShipmentID,
            business,
            shipment,
            Destination,
            Provider,
            status,
            createDateShipment: dateCreate,
        };

        const commentData = {
            creatorUser: uid,
            name: userDB.colla.name,
            lastname: userDB.colla.lastName,
            dateUpdate: marcaDeTiempo,
            observation: comment,
        };

        // Utilizando la opción upsert para crear el documento si no existe
        const updateBusinessDB = await shipmentComment.findOneAndUpdate({
            ShipmentID
        }, {
            $set: Shipment,
            $push: {
                comments: commentData
            },
        }, {
            new: true,
            upsert: true
        });

        res.json({
            ok: true,
            msg: `Se agregó correctamente el comentario al envío ${shipment.ShipmentCode}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error en el servidor',
        });
    }
};




const getViewPdfs = async (req, res = response) => { 

    const token = req.header('x-token');
    const {
        ShipmentID
    } = req.body;

    try {
        const decodedToken = await ShowTokenInComponents(token)
        const uid = decodedToken.msg.uid
        const bus = decodedToken.msg.bus

        // console.log('ShipmentID: ', ShipmentID + ' ' + typeof(ShipmentID))

        const viewPdf = await GetViewDocumentsPDF(ShipmentID)
        // console.log('viewPdf; ', viewPdf)

        res.json({
            ok: true,
            msg: viewPdf
        });
    } catch (error) {
        
    }
}






module.exports = {
    getViewshipment,
    getViewPdfs,
    getShipmentComment,
    getViewOneshipment,
};