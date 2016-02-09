window.onload = function() {
    // You might want to start with a template that uses GameStates:
    //     https://github.com/photonstorm/phaser/tree/master/resources/Project%20Templates/Basic
    
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    "use strict";
    
    var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    
    function preload() {
        // Load all images.
        game.load.image('sky', 'assets/sky1.png');
        game.load.image('ground', 'assets/newPlatform.png');
        game.load.image('sun', 'assets/sunorb.png');
        game.load.image('water', 'assets/waterorb.png');
        game.load.spritesheet('character', 'assets/darien.png', 32, 32);
        game.load.spritesheet('flower', 'assets/flower.png', 32, 32, 9);
        game.load.audio('grow', 'assets/Grow.wav');
        game.load.audio('water', 'assets/Water Pickup.wav');
        game.load.audio('sun', 'assets/Sun Pickup.wav');
        game.load.audio('jump', 'assets/jump.wav');

    }
    
    var background;
    var player;
    var platforms;
    var cursors;

    var sunOrbs;
    var waterOrbs;
    var waterScore = 0;
    var sunScore = 0;
    var totalScore = waterScore + sunScore;
    var collectedWater;
    var amountWater;
    var collectedSun;
    var amountSun;
    var flower;
    
    var jump;
    var waterPickup;
    var sunPickup;
    var grow;

    function create() {
        //  We're going to be using physics, so enable the Arcade Physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //  A background of the sky/clouds.
        background = game.add.sprite(0, 0, 'sky');
        
        // The group for platforms.
        platforms = game.add.group();

        //  Enable physics for platforms.
        platforms.enableBody = true;

        // Create the ground.
        var ground = platforms.create(0, game.world.height - 32, 'ground');
        ground.scale.setTo(2,1);
        ground.body.immovable = true;

        // Create ledges.
        var ledge = platforms.create(100, 480, 'ground');
        ledge.scale.setTo(.1,1);
        ledge.body.immovable = true;
        
        // Ledge holding the flower.
        ledge = platforms.create(362,175,'ground');
        ledge.scale.setTo(.15,1);
        ledge.body.immovable = true;
        
        ledge = platforms.create(0, 400, 'ground');
        ledge.scale.setTo(.1,1)
        ledge.body.immovable = true;
        
        ledge = platforms.create(120, 330, 'ground');
        ledge.scale.setTo(.2,1)
        ledge.body.immovable = true;
        
        ledge = platforms.create(300, 380, 'ground');
        ledge.scale.setTo(.25,1)
        ledge.body.immovable = true;
        
        ledge = platforms.create(425, 420, 'ground');
        ledge.scale.setTo(.1,1)
        ledge.body.immovable = true;
        
        ledge = platforms.create(475, 460, 'ground');
        ledge.scale.setTo(.1,1)
        ledge.body.immovable = true;
        
        ledge = platforms.create(475, 460, 'ground');
        ledge.scale.setTo(.1,1)
        ledge.body.immovable = true;
        
        ledge = platforms.create(550, 380, 'ground');
        ledge.scale.setTo(.1,1)
        ledge.body.immovable = true;
        
        ledge = platforms.create(610, 300, 'ground');
        ledge.scale.setTo(.4,1)
        ledge.body.immovable = true;
        
        // The flower.
        flower = game.add.sprite(360,100,'flower');
        flower.frame = 0;
        flower.scale.setTo(2.6,2.6);

        // The player and its settings
        player = game.add.sprite(32, game.world.height - 150, 'character');

        //  We need to enable physics on the player
        game.physics.arcade.enable(player);

        //  Player physics properties. Give the little guy a slight bounce.
        player.body.bounce.y = 0.2;
        player.body.gravity.y = 640;
        player.body.collideWorldBounds = true;

        //  Our two animations, walking left and right.
        player.animations.add('left', [3,4,5], 7, true);
        player.animations.add('right', [6,7, 8], 7, true);

        //  Finally some stars to collect
        sunOrbs = game.add.group();
        waterOrbs = game.add.group();

        //  We will enable physics for any star that is created in this group
        sunOrbs.enableBody = true;
        waterOrbs.enableBody = true;

        //  Create 10 randomly spaced sun orbs
        for (var i = 0; i < 12; i++) {
            //  Create a star inside of the 'stars' group
            var sunOrb = sunOrbs.create(750 * Math.random(), 175 + (100 * Math.random()), 'sun');
            sunOrb.scale.setTo(.25,.25);

            //  Let gravity do its thing
            sunOrb.body.gravity.y = 300;

            //  This just gives each star a slightly random bounce value
            sunOrb.body.bounce.y = 0.7 + Math.random() * 0.2;
        }
        
        // Create 5 randomly spaced water orbs
        for (var i = 0; i < 5; i++) {
            //  Create a star inside of the 'stars' group
            var waterOrb = waterOrbs.create(750 * Math.random(), 175 + (100 * Math.random()), 'water');
            waterOrb.scale.setTo(.25,.25);
            
            //  Let gravity do its thing
            waterOrb.body.gravity.y = 300;

            //  This just gives each star a slightly random bounce value
            waterOrb.body.bounce.y = 0.7 + Math.random() * 0.2;
        }
        
        // Adding sounds.
        waterPickup = game.add.audio('water');
        sunPickup = game.add.audio('sun');
        jump = game.add.audio('jump');
        grow = game.add.audio('grow');


        //  The score
        amountWater = game.add.text(50, 16, '0', { fontSize: '28px', fill: '#000' });
        amountSun = game.add.text(125, 16, '0', { fontSize: '28px', fill: '#000' });
        
        // Collected water.
        collectedWater = game.add.sprite(16, 16, 'water')
        collectedWater.scale.setTo(.2);
        collectedSun = game.add.sprite(90, 16, 'sun',0)
        collectedSun.scale.setTo(.2);

        //  The controls.
        cursors = game.input.keyboard.createCursorKeys();
  
    }
    
    function update() {
        //  Collide the player and the stars with the platforms
        game.physics.arcade.collide(player, platforms);
        game.physics.arcade.collide(sunOrbs, platforms);
        game.physics.arcade.collide(waterOrbs, platforms);
        game.physics.arcade.collide(waterOrbs, sunOrbs);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        game.physics.arcade.overlap(player, sunOrbs, collectSun, null, this);
        game.physics.arcade.overlap(player, waterOrbs, collectWater, null, this);

        //  Reset the players velocity (movement)
        player.body.velocity.x = 0;

        if (cursors.left.isDown) {
            //  Move to the left
            player.body.velocity.x = -150;

            player.animations.play('left');
        }
        else if (cursors.right.isDown) {
            //  Move to the right
            player.body.velocity.x = 150;

            player.animations.play('right');
        }
        else {
            //  Stand still
            player.animations.stop();

            player.frame = 1;
        }

        //  Allow the player to jump if they are touching the ground.
        if (cursors.up.isDown && player.body.touching.down) {
            player.body.velocity.y = -350;
            jump.play();
        }
        
        if (totalScore == 170) {
            flower.frame = 5;
        }
        else if (totalScore > 130) {
            flower.frame = 4;
        }
        else if (totalScore > 100) {
            flower.frame = 3;
        }
        else if (totalScore > 60) {
            flower.frame = 2;
        }
        else if (totalScore > 30) {
            flower.frame = 1;
        }

    }
    
    function collectSun (player, sunOrb) {
    
        // Removes the star from the screen
        sunOrb.kill();
        sunPickup.play();

        //  Add and update the score
        sunScore += 10;
        totalScore = sunScore + waterScore;
        amountSun.text = sunScore;

    }
    function collectWater (player, waterOrb) {
    
        // Removes the star from the screen
        waterOrb.kill();
        waterPickup.play();

        //  Add and update the score
        waterScore += 10;
        totalScore = sunScore + waterScore;
        amountWater.text = waterScore;

    }
    
};