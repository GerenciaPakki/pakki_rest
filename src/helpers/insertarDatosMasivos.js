const companyDiscount = require("../models/companyDiscount");



async function insertarDatosMasivosDiscount(id, DiscountData) {
    const { Country,Fee,RateIncrease,PakkiIncrease,PakkiDiscount,NumIni,NumFin } = DiscountData
    const idProvee = id;
    const options = { upsert: true };
    const proveedor = { _id: id };
    const dataToUpdate = [];
    // console.log('Datos de Entrada para Insertar Datos: ', NumFin)

    for (let i = NumIni; i <= NumFin; i += 0.5) {
        const newData = {
            Country: Country,
            Weight: i.toString(),
            Fee: Fee,
            RateIncrease: RateIncrease,
            PakkiIncrease: PakkiIncrease,
            PakkiDiscount: PakkiDiscount,
        };
        // console.log(`Insertando datos en Data[${i - 0.5}]:`);
        dataToUpdate.push(newData);
    }
    
    // actualiza el documento con todas las actualizaciones generadas en el bucle
    const updateDataDB = await companyDiscount.updateMany(proveedor, { $push: { Data: { $each: dataToUpdate } } }, options, (err, result) => {
        if (err) throw err;
        // console.log(`${result.modifiedCount} documento(s) actualizado(s)`);
    });
    // console.log(updateDataDB);
    return {
        ok: true,
        msg: `Se Cargo Correctamente los Incrementos a los Kilos desde ${NumIni} hasta ${NumFin}. `
    };
}


async function insertarOneDiscount(id, DiscountData) {
    const { Country, Fee, RateIncrease, PakkiIncrease, PakkiDiscount, NumIni, NumFin } = DiscountData;
    const options = { upsert: true };
    const proveedor = { _id: id };

    const newData = {
        Country: Country,
        Fee: Fee,
        RateIncrease: RateIncrease,
        PakkiIncrease: PakkiIncrease,
        PakkiDiscount: PakkiDiscount,
        NumIni: NumIni,
        NumFin: NumFin
    };

    try {
        const result = await companyDiscount.updateOne(proveedor, { $set: newData }, options);
        return {
            ok: true,
            msg: result
        }
    } catch (err) {
        return {
            ok: false,
            msg: 'Error al Actualizar la informacion del Discount'
        }
    }
}


async function updateOneDiscount(id, DiscountData) {
    const { Country, Fee, RateIncrease, PakkiIncrease, PakkiDiscount, dataID } = DiscountData;
    
    
    try {
        const result = await companyDiscount.findOneAndUpdate({
                _id: id,
                "Data._id": dataID
            }, {
                $set: {
                    "Data.$.Country": Country,
                    "Data.$.Fee": Fee,
                    "Data.$.RateIncrease": RateIncrease,
                    "Data.$.PakkiIncrease": PakkiIncrease,
                    "Data.$.PakkiDiscount": PakkiDiscount
                }
            }, {
                returnOriginal: false
            } // para obtener el documento actualizado
        );
        return {
            ok: true,
            msg: 'Se actualizo Correctamente el documento.'
        }
    } catch (err) {
        return {
            ok: false,
            msg: 'Error al Actualizar la informacion del Discount'
        }
    }
}





module.exports = {
    insertarDatosMasivosDiscount,
    insertarOneDiscount,
    updateOneDiscount
}

