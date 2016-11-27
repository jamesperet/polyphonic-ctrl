'use strict';

/**
 * @ngdoc function
 * @name infernoQuadrifonicoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the infernoQuadrifonicoApp
 */
angular.module('infernoQuadrifonicoApp')
  .controller('MainCtrl', function ($http, $scope, $interval, $localStorage) {

    var useLocalStorage = false;
    var socket = io("", { query: "type=controller"});
    $scope.playing = [];

    $scope.sound_mode = "stereo";

    $scope.changeSoundMode = function(){
      if($scope.sound_mode == "stereo"){
        $scope.sound_mode = "surround";
      } else {
        $scope.sound_mode = "stereo"
      }
    }

    $http.get('roteiro.json')
     .then(function(res){
        if($localStorage.roteiro && useLocalStorage){
          console.log("Loading data from localstorage...")
          $scope.roteiro = angular.copy($localStorage.roteiro);
        } else {
          console.log("Loading data from file...")
          $scope.roteiro = res.data.estrofe;
          for (var i = 0; i < $scope.roteiro.length; i++) {
            for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
              $scope.roteiro[i].arquivos[c].playing = false;
              $scope.roteiro[i].arquivos[c].seek = 0;
              $scope.roteiro[i].arquivos[c].surround_x = 0;
              $scope.roteiro[i].arquivos[c].surround_y = 0;
              $scope.loadAudioFile($scope.roteiro[i].arquivos[c]);
              $scope.roteiro[i].arquivos[c].show = true;
            }
          }
        }
        console.log($scope.roteiro);
        var interval = $interval(function() {
          updateSeekers();
        }, 25);
        var save = $interval(function() {
          $localStorage.roteiro = angular.copy($scope.roteiro);
          console.log("Autosaving...")
          //console.log($localStorage);
        }, 15000);
        //$interval.cancel(interval);
    });

    $scope.loadAudioFile = function(arquivo){
      for (var i = 0; i < $scope.roteiro.length; i++) {
        for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
          if($scope.roteiro[i].arquivos[c].url == arquivo.url){
            var sound = new Howl({
              usingWebAudio: true,
              html5: false,
              src: [$scope.roteiro[i].arquivos[c].url],
              autoplay: false,
              loop: $scope.roteiro[i].arquivos[c].loop,
              volume: ($scope.roteiro[i].arquivos[c].volume/100),
              //stereo: $scope.roteiro[i].arquivos[c].pan,
              onend: function(id) {
                for (var i = 0; i < $scope.roteiro.length; i++) {
                  for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
                    if($scope.roteiro[i].arquivos[c].id == id){
                      $scope.roteiro[i].arquivos[c].playing = false;
                      $scope.roteiro[i].arquivos[c].seek = 0;
                      console.log('Finished: ' + id + " | playing: " + $scope.roteiro[i].arquivos[c].playing);
                      $scope.$apply();
                      delete $scope.roteiro[i].arquivos[c].sound;
                      break;
                    }
                  }
                }
              }
            });
          }
        }
      }
    }

    $scope.playAudio = function(estrofe){
      //console.log(estrofe)
      for (var i = 0; i < estrofe.arquivos.length; i++) {
        $scope.playAudioFile(estrofe.arquivos[i]);
      }
    }

    $scope.playAudioFile = function(arquivo){
      for (var i = 0; i < $scope.roteiro.length; i++) {
        for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
          if($scope.roteiro[i].arquivos[c].url == arquivo.url){
            if($scope.roteiro[i].arquivos[c].sound) {
              //$scope.roteiro[i].arquivos[c].sound.volume($scope.roteiro[i].arquivos[c].volume/100);
              //$scope.roteiro[i].arquivos[c].sound.stereo($scope.roteiro[i].arquivos[c].pan/100);
              //$scope.roteiro[i].arquivos[c].sound.stop();
              //$scope.roteiro[i].arquivos[c].sound.play();
            } else {
              var sound = new Howl({
                //usingWebAudio: true,
                //html5: false,
                src: [$scope.roteiro[i].arquivos[c].url],
                autoplay: false,
                loop: $scope.roteiro[i].arquivos[c].loop,
                volume: ($scope.roteiro[i].arquivos[c].volume/100),
                //stereo: $scope.roteiro[i].arquivos[c].pan,
                onend: function(id) {
                  for (var i = 0; i < $scope.roteiro.length; i++) {
                    for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
                      if($scope.roteiro[i].arquivos[c].id == id){
                        $scope.roteiro[i].arquivos[c].playing = false;
                        $scope.roteiro[i].arquivos[c].seek = 0;
                        console.log('Finished: ' + id + " | playing: " + $scope.roteiro[i].arquivos[c].playing);
                        $scope.$apply();
                        delete $scope.roteiro[i].arquivos[c].sound;
                        break;
                      }
                    }
                  }
                }
              });
              $scope.roteiro[i].arquivos[c].sound = sound
              //$scope.roteiro[i].arquivos[c].id = sound.play();
            }
            if($scope.sound_mode == "stereo"){
              $scope.roteiro[i].arquivos[c].sound.stereo($scope.roteiro[i].arquivos[c].pan);
            } else {
              //$scope.roteiro[i].arquivos[c].surround = [-1, 1, 1];
              var x = $scope.roteiro[i].arquivos[c].surround_x;
              var y = $scope.roteiro[i].arquivos[c].surround_y
              $scope.roteiro[i].arquivos[c].sound.pos(x, y, 1);
            }
            $scope.roteiro[i].arquivos[c].playing = true;
            var d = $scope.roteiro[i].arquivos[c].sound.duration();
            var s = $scope.roteiro[i].arquivos[c].seek;
            $scope.roteiro[i].arquivos[c].sound.seek((d * s)/100)
            console.log('Playing: ' + $scope.roteiro[i].arquivos[c].id + " | " + Math.floor((d * s)/100));
            sendPlayCommand($scope.roteiro[i].arquivos[c]);
          }
        }
      }
    }

    $scope.stopAudioFile = function(arquivo){
      for (var i = 0; i < $scope.roteiro.length; i++) {
        for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
          if($scope.roteiro[i].arquivos[c].url == arquivo.url){
            //$scope.roteiro[i].arquivos[c].sound.stop();
            //delete $scope.roteiro[i].arquivos[c].sound;
            $scope.roteiro[i].arquivos[c].playing = false;
            //$scope.roteiro[i].arquivos[c].seek = 0;
            sendStopCommand($scope.roteiro[i].arquivos[c])
            console.log('Finished: ' + $scope.roteiro[i].arquivos[c].id + " | " + $scope.roteiro[i].arquivos[c].playing);
          }
        }
      }
    }

    $scope.stopPlayback = function(){
      for (var i = 0; i < $scope.roteiro.length; i++) {
        for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
          if($scope.roteiro[i].arquivos[c].sound){
            //$scope.roteiro[i].arquivos[c].sound.stop();
            sendStopCommand($scope.roteiro[i].arquivos[c]);
            //delete $scope.roteiro[i].arquivos[c].sound;
            $scope.roteiro[i].arquivos[c].playing = false;
            $scope.roteiro[i].arquivos[c].seek = 0;
            console.log('Finished: ' + $scope.roteiro[i].arquivos[c].id + " | " + $scope.roteiro[i].arquivos[c].seek);
          }
        }
      }
    }

    var updateSeekers = function() {
      for (var i = 0; i < $scope.roteiro.length; i++) {
        for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
          if($scope.roteiro[i].arquivos[c].sound){
            var d = $scope.roteiro[i].arquivos[c].sound.duration();
            var s = $scope.roteiro[i].arquivos[c].sound.seek()
            $scope.roteiro[i].arquivos[c].seek = (s/d)*100
            //console.log("updating seek position to: " + ((s/d)*100));
          }
        }
      }
    }

    $scope.isStereo = function(){
      if($scope.sound_mode == "stereo"){
        return true;
      } else {
        return false;
      }
    }

    $scope.options_seek = {
      from: 0,
      to: 100,
      step: 1,
      realtime: true,
      css: {
          background: {"background-color": "white"},
          before: {"background-color": "white"},// zone before default value
          default: {"background-color": "white"}, // default value: 1px
          after: {"background-color": "white"},  // zone after default value
          pointer: {"background-color": "#999"},   // circle pointer
          range: {"background-color": "white"} // use it if double value
      },
      //scale: [{val:50, label: ""}],
      callback: function(value, elt) {
          console.log("Seek: " + value);
          updateTrackPosition();
      }
    }

    $scope.options_volume = {
        from: 0,
        to: 100,
        step: 1,
        realtime: true,
        scale: [{val:50, label:'volume'}],
        css: {
            background: {"background-color": "white"},
            before: {"background-color": "white"},// zone before default value
            default: {"background-color": "white", "height" : "10px;"}, // default value: 1px
            after: {"background-color": "white"},  // zone after default value
            pointer: {"background-color": "#999"},   // circle pointer
            range: {"background-color": "white"} // use it if double value
        },
        callback: function(value, elt) {
            console.log("Volume: " + value);
            updateActiveVolume();
        }
    };

    $scope.options_pan = {
        from: -100,
        to: 100,
        step: 1,
        realtime: true,
        scale: [{val: 0, label:'stereo'}],
        css: {
            background: {"background-color": "white"},
            before: {"background-color": "white"},// zone before default value
            default: {"background-color": "white"}, // default value: 1px
            after: {"background-color": "white"},  // zone after default value
            pointer: {"background-color": "#999"},   // circle pointer
            range: {"background-color": "white"} // use it if double value
        },
        callback: function(value, elt) {
            console.log("Pan:    " + value);
            updateActivePan();
        }
    };

    $scope.options_surround_x = {
        from: -100,
        to: 100,
        step: 1,
        realtime: true,
        scale: [{val: 0, label:'X'}],
        css: {
            background: {"background-color": "white"},
            before: {"background-color": "white"},// zone before default value
            default: {"background-color": "white"}, // default value: 1px
            after: {"background-color": "white"},  // zone after default value
            pointer: {"background-color": "#999"},   // circle pointer
            range: {"background-color": "white"} // use it if double value
        },
        callback: function(value, elt) {
            console.log("Surround X:    " + value);
            updateActiveSurround();
        }
    };

    $scope.options_surround_y = {
        from: -100,
        to: 100,
        step: 1,
        realtime: true,
        scale: [{val:0, label:'Y'}],
        css: {
            background: {"background-color": "white"},
            before: {"background-color": "white"},// zone before default value
            default: {"background-color": "white"}, // default value: 1px
            after: {"background-color": "white"},  // zone after default value
            pointer: {"background-color": "#999"},   // circle pointer
            range: {"background-color": "white"} // use it if double value
        },
        callback: function(value, elt) {
            console.log("Surround Y:    " + value);
            updateActiveSurround();
        }
    };

    var updateTrackPosition = function(){
      for (var i = 0; i < $scope.roteiro.length; i++) {
        for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
          if($scope.roteiro[i].arquivos[c].playing == true){
            if($scope.roteiro[i].arquivos[c].sound){
              var d = $scope.roteiro[i].arquivos[c].sound.duration();
              var s = $scope.roteiro[i].arquivos[c].seek;
              var v = $scope.roteiro[i].arquivos[c].sound.seek();
              if(v - ((d * s)/100) > 0.5 || v - ((d * s)/100) < -0.5){
                //$scope.roteiro[i].arquivos[c].sound.seek((d * s)/100)
                var arquivo = $scope.roteiro[i].arquivos[c];
                delete arquivo.sound;
                delete arquivo.volume;
                arquivo.seek = (d * s)/100;
                socket.emit('update playback', arquivo);
              }
            }
          }
        }

      }
    }

    var updateActiveVolume = function(){
      for (var i = 0; i < $scope.roteiro.length; i++) {
        for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
          if($scope.roteiro[i].arquivos[c].playing == true){
            var arquivo = $scope.roteiro[i].arquivos[c];
            if($scope.roteiro[i].arquivos[c].sound){
              delete arquivo.sound;
            }
            delete arquivo.pan;
            delete arquivo.seek;
            socket.emit('update playback', arquivo);
          }
        }

      }
    }

    var updateActivePan = function(){
      for (var i = 0; i < $scope.roteiro.length; i++) {
        for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
          if($scope.roteiro[i].arquivos[c].playing == true){
            var arquivo = $scope.roteiro[i].arquivos[c];
            if($scope.roteiro[i].arquivos[c].sound){
              delete arquivo.sound;
            }
            delete arquivo.volume;
            delete arquivo.seek;
            socket.emit('update playback', arquivo);
          }
        }

      }
    }

    var updateActiveSurround = function(){
      for (var i = 0; i < $scope.roteiro.length; i++) {
        for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
          if($scope.roteiro[i].arquivos[c].sound){
            var x = $scope.roteiro[i].arquivos[c].surround_x/100;
            var y = $scope.roteiro[i].arquivos[c].surround_y/100;
            $scope.roteiro[i].arquivos[c].sound.pos(x, y, 1)
          }
        }

      }
    }

    $scope.isEmpty = function(text){
      if(text != ""){ return false; } else { return true; }
    }

    var sendPlayCommand = function(arquivo){
       delete arquivo.sound;
       socket.emit('play', arquivo);
    }

    var sendStopCommand = function(arquivo){
       delete arquivo.sound;
       socket.emit('stop', arquivo);
    }

    socket.on('play ended', function(arquivo){
      for (var i = 0; i < $scope.roteiro.length; i++) {
        for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
          if($scope.roteiro[i].arquivos[c].url == arquivo.url){
            $scope.roteiro[i].arquivos[c].seek = 0;
            $scope.roteiro[i].arquivos[c].playing = false;
            //delete $scope.roteiro[i].arquivos[c].sound;
            console.log('Finished: ' + $scope.roteiro[i].arquivos[c].url + " | playing: " + $scope.roteiro[i].arquivos[c].playing);
            break;
          }
        }
      }
    });

  });
