db.users.find({name: "Valentina"}).pretty()
db.business.find({"business.businessname": "kevin branches"}).pretty()
db.profiles.find({ name: "Commercial" }).pretty()

// Consultar los index de una collecion
db.business.getIndexes()
// Eliminar un index segun la consulta anterior
db.business.dropIndex('branchoffices.tradename_1')

db.companyDiscounts.aggregate([{
        $match: {
            Provider: 'FDX',
            ServiceName: 'INTERNATIONAL_ECONOMY',
            ServiceType: 'PKG',
        }
    },
    {
        $project: {
            _id: 1,
            Provider: 1,
            ServiceName: 1,
            ServiceCode: 1,
            Domestic: 1,
            ServiceType: 1,
            Data: {
                $slice: ['$Data', 5]
            }
        }
    }
]);

// TODO: Borrar todo el objeto DATA segun el proveedor
db.companyDiscounts.updateMany({
    Provider: 'FDX',
    ServiceName: 'INTERNATIONAL_ECONOMY',
    ServiceType: 'PKG',
}, {
    $unset: {
        Data: 1
    }
});

// Actualizar los status a true para ser leido por defect y mosrtrar al perfil
db.menuprofiles.updateOne({
    "title": "Aliados",
    "children.title": "Ver Aliados"
}, {
    $set: {
        "children.$.title": "Ver/Crear Aliados"
    }
});

db.menuprofiles.updateOne({
    "title": "Pakki Admin",
    "profile": "Pakki",
    "menu.title": "Aliados",
    "menu.children.title": "Crear Aliados"
}, {
    $set: {
        "menu.$[menuItem].children.$[childItem].title": "Editar Aliados"
    }
}, {
    arrayFilters: [{
            "menuItem.title": "Aliados"
        },
        {
            "childItem.title": "Crear Aliados"
        }
    ]
});
db.menuprofiles.updateOne({
    "title": "Pakki Admin",
    "profile": "Pakki",
    "menu.title": "Aliados",
    "menu.children.title": "Ver Aliados"
}, {
    $set: {
        "menu.$[menuItem].children.$[childItem].title": "Ver/Crear Aliados"
    }
}, {
    arrayFilters: [{
            "menuItem.title": "Aliados"
        },
        {
            "childItem.title": "Ver Aliados"
        }
    ]
});

db.menuprofiles.updateMany({
    "title": "Pakki Admin",
    "profile": "Pakki",
    "menu.title": "Incidencias"
}, {
    $set: {
        "menu.$.status": true
    }
});

db.menuprofiles.updateOne({
    "title": "Pakki Admin",
    "profile": "Pakki",
    "menu.path": "discounts",
    "menu.title": "Descuentos"
}, {
    $set: {
        "menu.$.status": false
    }
});


{
    _id: ObjectId("6583375b434215cf7e651fe5"),
    _id: ObjectId("65e1e4c42242088ece6ff277"),
    _id: ObjectId("65e1f47a779737d73843c7de"),
    _id: ObjectId("65e1f502779737d73843c7ee"),
    _id: ObjectId("65e1f5c3779737d73843c821"),

]


_id: ObjectId("661858e68d76039da9d65f84")

db.users.find({
    "email": "cristianrod83@gmail.com"
});
db.users.deleteOne({
    "email": "cristianrod83@gmail.com"
});
db.businessUsers.deleteOne({
    "colla.email": "cristianrod83@gmail.com"
});

db.businessUsers.find().pretty();
db.collaborators.find().pretty();

db.businessUsers.find({
    "colla.collaborator": "661eaf305c54ad4f216d2842"
});
db.collaborators.find({
    "colla.collaborator": "661eaf305c54ad4f216d2842"
});
