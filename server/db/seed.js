
var AdminModel = local.AdminModel;
Admin
    .findOne({username: AdminModel.username})
    .then(function(admin){
      if(!admin){
        Admin
            .create(AdminModel)
            .then(function(admin){
              console.log("======SEED=====");
              console.log(admin);
            })
            .catch(function(error){
              console.log("======SEED ERROR=====");
              console.log(error);
            });
      }
    });