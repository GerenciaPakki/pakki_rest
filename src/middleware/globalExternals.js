const axios = require('axios');// node commonJS bundle (ES2017)
const Trm = require('../models/trm');
const cron = require('node-cron');

const { fecha, dates } = require('../helpers/pakkiDateTime');

const date = fecha;
// const { DateTime } = require("luxon");
// const fechaActual = DateTime.local();
// const date = fechaActual.minus({ days: 1 }).toISODate();


cron.schedule('15 09 * * *', async () => {
    await trm();
    console.log('Creamos TRM ...');
});

const saveTrmData = async (response) => {
    
    const trmData = new Trm({
        unit: response.data.data.unit,
        validityFrom: response.data.data.validityFrom,
        validityTo: response.data.data.validityTo,
        value: response.data.data.value,
        success: response.data.data.success,
        date: date,
    });

    const filter = {
        validityFrom: trmData.validityFrom,
        validityTo: trmData.validityTo
    };

    const options = {
        upsert: true,
        setDefaultsOnInsert: true
    };

    // const tm = await Trm.findOneAndUpdate( trmData, options);
    const tm = await trmData.save();
};

const trm = async () => {
    try {
        const response = await axios.get("https://trm-colombia.vercel.app/", {
            params: {
                date
            }
        });
        // console.log(response.data.data);
        await saveTrmData(response);
    } catch (error) {
        console.error(error);
    }
};

async function getMaxTRM() {
    const fechaHasta = dates; // fecha actual
    const fechaDesde = fechaHasta.minus({
        days: 15
    }); // fecha hace 15 días atrás

    // Formatear fechas a "YYYY-MM-DD"
    const fechaHastaFormateada = fechaHasta.toISODate().split('T')[0];
    const fechaDesdeFormateada = fechaDesde.toISODate().split('T')[0]; // fecha de base Local"2023-12-04" //

    const result = await Trm.findOne({
        date: {
            $gte: fechaDesdeFormateada,
            $lte: fechaHastaFormateada,
        },
    }, {
        _id: 0,
        value: 1
    }, {
        sort: {
            value: -1
        },
        limit: 1
    });

    try {
      return result;
    } catch (err) {
      console.error(err);
    } 
}



module.exports = {
    trm,
    getMaxTRM,
};