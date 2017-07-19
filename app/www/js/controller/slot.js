angular
    .module('app')
    .controller("SlotCtrl", function (staffWorking, CONSTANT, $ionicHistory, socketService, $rootScope) {
      var resources = [];
      var staticResources = [
        {id: "bg", src: CONSTANT.apiUrl + "/img/img_body3.jpg"},
        {id: "bgEnd", src: CONSTANT.apiUrl + "/img/img_balloon_with_bg.jpg"},
        {id: "btnWood", src: CONSTANT.apiUrl + "/img/bkg_wood_button.jpg"},
        {id: "shake", src: CONSTANT.apiUrl + "/img/hand-shake-love.jpg"},
        {id: "lv1", src: CONSTANT.apiUrl + "/img/img_lever_01.jpg"},
        {id: "lv2", src: CONSTANT.apiUrl + "/img/img_lever_02.jpg"},
        {id: "lv3", src: CONSTANT.apiUrl + "/img/img_lever_03.jpg"},
        {id: "lv4", src: CONSTANT.apiUrl + "/img/img_lever_04.jpg"},
        {id: "lv5", src: CONSTANT.apiUrl + "/img/img_lever_05.jpg"},
        {id: "lv6", src: CONSTANT.apiUrl + "/img/img_lever_06.jpg"},
        {id: "lv7", src: CONSTANT.apiUrl + "/img/img_lever_07.jpg"},
        {id: "lv8", src: CONSTANT.apiUrl + "/img/img_lever_08.jpg"}
      ];

      _.each(staffWorking.data, function (staff, i) {
        resources.push({
          id: i,
          src: CONSTANT.apiUrl + "/" + staff.avatarUrl
        });
      });

      var stage = null;
      var bgContainer = new createjs.Container();
      var sheetContainerLeft = new createjs.Container();
      var sheetContainerRight = new createjs.Container();
      var containerLever = new createjs.Container();
      var containerButton = new createjs.Container();
      var text = new createjs.Text("Cleaning\' time", "68px CaviarDreamsBold", "#ff7700");
      var queue = new createjs.LoadQueue();
      var iconToScale = 3.5;
      var pressed = false;
      var lastPositionY = 0;
      var step = 50;
      var topLever = 10;
      var bottomLever = 0;
      var lever = null;
      var bg = null;
      var avatarLeft = null;
      var avatarRight = null;
      var allResource = resources.concat(staticResources);
      var containerBtn1 = new createjs.Container();
      var containerBtn2 = new createjs.Container();
      var name1 = new createjs.Text("", "28px CaviarDreamsBold", "#ff7700");
      var name2 = new createjs.Text("", "28px CaviarDreamsBold", "#ff7700");

      //Sound
      var soundLever = null;
      var soundRun = null;

      //Slot
      var isRunning = false;
      var durationOfRunning = 15;
      var peaceOfRun = 0.05;
      var timeToRunSlot = 0;

      //Load images
      if(resources.length <= 1){
        $ionicHistory.goBack();
        socketService.emit("refresh-data");
        $rootScope.$broadcast("fetch-data");
      }else{
        queue.loadManifest(allResource);
      }

      queue.on("complete", initStage);

      function initStage() {
        stage = new createjs.Stage("slot");
        var w = window.screen.width;
        var h = window.screen.height;
        stage.canvas.width = w < h ? h : w;
        stage.canvas.height = w < h ? w : h;
        createjs.Touch.enable(stage);

        sheetContainerLeft.x = 65;
        sheetContainerLeft.y = 195;

        sheetContainerRight.x = 450;
        sheetContainerRight.y = 195;

        //Add background
        bg = new createjs.Bitmap(queue.getResult("bg"));
        bgContainer.addChild(bg);

        //Text
        text.y = 40;
        text.x = (bg.image.width - text.getBounds().width) / 2;
        bgContainer.addChild(text);

        var btnWood1 = new createjs.Bitmap(queue.getResult("btnWood"));
        var btnWood2 = new createjs.Bitmap(queue.getResult("btnWood"));
        btnWood1.scaleX = 0.8;
        btnWood1.scaleY = 0.8;
        btnWood2.scaleX = 0.8;
        btnWood2.scaleY = 0.8;
        containerBtn1.addChild(btnWood1);
        containerBtn1.addChild(name1);
        name1.y = 35;
        containerBtn1.x = 0;


        containerBtn2.addChild(btnWood2);
        containerBtn2.addChild(name2);
        name2.y = 35;
        containerBtn2.x = btnWood2.image.width;


        containerButton.addChild(containerBtn1);
        containerButton.addChild(containerBtn2);

        containerButton.y = stage.canvas.height - btnWood1.image.height - 25;
        containerButton.x = 60;

        //Add background and text to stage
        stage.addChild(bgContainer);
        stage.addChild(containerButton);


        //Lever object
        lever = new createjs.Bitmap(queue.getResult("lv1"));
        containerLever.addChild(lever);
        containerLever.y = topLever;
        containerLever.x = bg.image.width - 2;
        bottomLever = containerLever.y + containerLever.getBounds().height;

        //Add container of lever to stage
        stage.addChild(containerLever);


        //When tap on lever
        var onTapLever = function (event) {
          if (isRunning) return;
          if (event.stageY <= (event.currentTarget.y + event.currentTarget.getBounds().height)) {
            pressed = true;
          }
        };


        //When user dragging
        var onDragLever = function (event) {
          if (!pressed) return;

          lastPositionY = event.stageY;
          setLeverImage();

          var containerHeight = event.currentTarget.getBounds().height;
          event.currentTarget.set({
            y: bottomLever - containerHeight
          });

          //Release
          if (lastPositionY > 350) {
            pressed = false;
            soundLever = createjs.Sound.play("lever");
            runSlot();
            setText("I am looking...");
            soundLever.on("complete", function () {
              soundRun = createjs.Sound.play("run", {loop: -1});
            });
          }
        };

        //When user release lever
        var onReleaseLever = function (event) {
          pressed = false;
          createjs
              .Tween
              .get(event.currentTarget, {override: true})
              .to({
                y: topLever
              }, 50, createjs.Ease.linear)
              .addEventListener("change", function () {
                lastPositionY = containerLever.y;
                setLeverImage();
              });
        };

        containerLever.addEventListener("mousedown", onTapLever, false);
        containerLever.addEventListener("pressmove", onDragLever, false);
        containerLever.addEventListener("pressup", onReleaseLever, false);


        avatarLeft = new createjs.Bitmap(queue.getResult(0));
        sheetContainerLeft.addChild(avatarLeft);
        sheetContainerLeft.scaleX = iconToScale;
        sheetContainerLeft.scaleY = iconToScale;

        avatarRight = new createjs.Bitmap(queue.getResult(0));
        sheetContainerRight.addChild(avatarRight);
        sheetContainerRight.scaleX = iconToScale;
        sheetContainerRight.scaleY = iconToScale;

        //Add sheetContainer to stage
        stage.addChild(sheetContainerLeft);
        stage.addChild(sheetContainerRight);


        //mix image to show
        setRandomImageSlot();

        //Re draw
        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener("tick", stage);
      }

      function setLeverImage() {

        if (lastPositionY < step) {
          lever.image = queue.getResult("lv1");
        }

        if (lastPositionY >= step && lastPositionY < step * 2) {
          lever.image = queue.getResult("lv2");
        }

        if (lastPositionY >= step * 2 && lastPositionY < step * 3) {
          lever.image = queue.getResult("lv3");
        }

        if (lastPositionY >= step * 3 && lastPositionY < step * 4) {
          lever.image = queue.getResult("lv4");
        }

        if (lastPositionY >= step * 4 && lastPositionY < step * 5) {
          lever.image = queue.getResult("lv5");
        }

        if (lastPositionY >= step * 5 && lastPositionY < step * 6) {
          lever.image = queue.getResult("lv6");
        }


        if (lastPositionY >= step * 6 && lastPositionY < step * 7) {
          lever.image = queue.getResult("lv7");
        }


        if (lastPositionY >= step * 7 && lastPositionY < step * 8) {
          lever.image = queue.getResult("lv8");
        }
      }

      function runSlot() {
        isRunning = true;
        timeToRunSlot += peaceOfRun;
        setRandomImageSlot(timeToRunSlot, function () {
          if (timeToRunSlot <= durationOfRunning) {
            runSlot();
          } else {
            isRunning = false;
            timeToRunSlot = 0;
            setText("Congratulation!!!");

            soundRun.stop();
            createjs.Sound.play("bingo");
          }
        });
      }

      function setRandomImageSlot(duration, cb) {
        var count = 0;
        var d = duration || 0;
        var leftIndex = getRandomInt(0, resources.length - 1);
        var rightIndex = getRandomInt(0, resources.length - 1);

        while (leftIndex === rightIndex) {
          rightIndex = getRandomInt(0, resources.length - 1);
        }

        name1.set({
          text: staffWorking.data[leftIndex].name
        });
        name1.x = (containerBtn1.getBounds().width - name1.getBounds().width) / 2;
        name2.set({
          text: staffWorking.data[rightIndex].name
        });
        name2.x = (containerBtn2.getBounds().width - name2.getBounds().width) / 2;

        avatarLeft.alpha = 0.5;
        avatarRight.alpha = 0.5;
        avatarLeft.image = queue.getResult(leftIndex);
        avatarRight.image = queue.getResult(rightIndex);

        createjs
            .Tween
            .get(avatarLeft, {override: true})
            .to({alpha: 1}, d, createjs.Ease.elasticIn)
            .call(handleComplete);


        createjs
            .Tween
            .get(avatarRight, {override: true})
            .to({alpha: 1}, d, createjs.Ease.elasticIn)
            .call(handleComplete);

        function handleComplete() {
          count++;
          if (count === 2 && cb) {
            cb();
          }
        }
      }

      function setText(str) {
        text.set({
          text: str
        });
        text.x = (bg.image.width - text.getBounds().width) / 2;
      }

      function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }


      //Load sound
      // createjs.Sound.addEventListener("fileload", handleFileLoad);
      createjs.Sound.alternateExtensions = ["mp3"];
      createjs.Sound.registerSounds([
        {id: "lever", src: CONSTANT.apiUrl + "/sound/lever.mp3"},
        {id: "bingo", src: CONSTANT.apiUrl + "/sound/bingo.mp3"},
        {id: "run", src: CONSTANT.apiUrl + "/sound/slot_machine_sounds.mp3"}
      ]);


      // function handleFileLoad(event) {
      //   // A sound has been preloaded. This will fire TWICE
      //   console.log("Preloaded:", event.id, event.src);
      // }
    });
