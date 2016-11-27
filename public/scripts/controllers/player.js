'use strict';

/**
 * @ngdoc function
 * @name infernoQuadrifonicoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the infernoQuadrifonicoApp
 */
angular.module('infernoQuadrifonicoApp')
  .controller('PlayerCtrl', function ($http, $scope, $interval, $localStorage) {

    var channel = 0;
    $scope.current_channel = 1;

    $scope.changeChannel = function() {
      if(channel == 0){
        channel = 1;
        $scope.current_channel = 2;
      } else {
        channel = 0;
        $scope.current_channel = 1;
      }
      console.log("changing to channel " + channel);
    }

    var socket = io();
    socket.on('play', function(arquivo){
      console.log("Playing file: " + arquivo.url)
      $scope.playAudioFile(arquivo);
    });

    socket.on('stop', function(arquivo){
      console.log("Playing file: " + arquivo.url)
      $scope.stopAudioFile(arquivo);
    });

    socket.on('update playback', function(arquivo){
      console.log("Updating playback: " + arquivo.url)
      $scope.updatePlayback(arquivo);
    });

    $http.get('roteiro.json')
     .then(function(res){
       console.log("Loading data from file...")
       $scope.roteiro = res.data.estrofe;
       for (var i = 0; i < $scope.roteiro.length; i++) {
         for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
           $scope.roteiro[i].arquivos[c].playing = false;
           $scope.roteiro[i].arquivos[c].channels[0].seek = 0;
           $scope.roteiro[i].arquivos[c].channels[1].seek = 0;
           $scope.loadAudioFile($scope.roteiro[i].arquivos[c]);
           $scope.roteiro[i].arquivos[c].show = true;
         }
       }
        console.log($scope.roteiro);
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
              volume: ($scope.roteiro[i].arquivos[c].channels[channel].volume/100),
              stereo: $scope.roteiro[i].arquivos[c].channels[channel].pan,
              onend: function(id) {
                for (var i = 0; i < $scope.roteiro.length; i++) {
                  for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
                    if($scope.roteiro[i].arquivos[c].id == id){
                      $scope.roteiro[i].arquivos[c].playing = false;
                      $scope.roteiro[i].arquivos[c].channels[channel].seek = 0;
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

    $scope.playAudioFile = function(arquivo){

      for (var i = 0; i < $scope.roteiro.length; i++) {
        for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
          if($scope.roteiro[i].arquivos[c].url == arquivo.url){
            //$scope.roteiro[i].arquivos[c].volume = arquivo.channels[channel].volume;
            //$scope.roteiro[i].arquivos[c].pan = arquivo.channels[channel].pan;
            //$scope.roteiro[i].arquivos[c].seek = arquivo.channels[channel].seek;
            $scope.roteiro[i].arquivos[c].channels = arquivo.channels;
            console.log($scope.roteiro[i].arquivos[c])
            var channels = $scope.roteiro[i].arquivos[c].channels;
            console.log("received: " + $scope.roteiro[i].arquivos[c].url.split("public/audio/").pop() + " (" + channels[0].volume + "/" + channels[1].volume + " | " + channels[0].pan + "/" + channels[1].pan + ")")
            console.log("playing: " + $scope.roteiro[i].arquivos[c].url.split("public/audio/").pop() + " (" + channels[channel].volume + " | " + channels[channel].pan + ")")
            if($scope.roteiro[i].arquivos[c].sound) {
              $scope.roteiro[i].arquivos[c].sound.volume($scope.roteiro[i].arquivos[c].channels[channel].volume/100);
              $scope.roteiro[i].arquivos[c].sound.stereo($scope.roteiro[i].arquivos[c].channels[channel].pan/100);
              $scope.roteiro[i].arquivos[c].sound.stop();
              $scope.roteiro[i].arquivos[c].sound.play();
            } else {
              var sound = new Howl({
                //usingWebAudio: true,
                //html5: false,
                src: [$scope.roteiro[i].arquivos[c].url],
                autoplay: false,
                loop: $scope.roteiro[i].arquivos[c].loop,
                volume: ($scope.roteiro[i].arquivos[c].channels[channel].volume/100),
                stereo: $scope.roteiro[i].arquivos[c].channels[channel].pan,
                onend: function(id) {
                  for (var i = 0; i < $scope.roteiro.length; i++) {
                    for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
                      if($scope.roteiro[i].arquivos[c].id == id){
                        $scope.roteiro[i].arquivos[c].playing = false;
                        $scope.roteiro[i].arquivos[c].seek = 0;
                        console.log('finished: ' + $scope.roteiro[i].arquivos[c].url.split("public/audio/").pop());
                        $scope.$apply();
                        delete $scope.roteiro[i].arquivos[c].sound;
                        socket.emit('play ended', $scope.roteiro[i].arquivos[c]);
                        break;
                      }
                    }
                  }
                }
              });
              $scope.roteiro[i].arquivos[c].sound = sound
              $scope.roteiro[i].arquivos[c].id = sound.play();
            }
            $scope.roteiro[i].arquivos[c].sound.stereo($scope.roteiro[i].arquivos[c].pan);
            $scope.roteiro[i].arquivos[c].playing = true;
            var d = $scope.roteiro[i].arquivos[c].sound.duration();
            var s = $scope.roteiro[i].arquivos[c].channels[channel].seek;
            $scope.roteiro[i].arquivos[c].sound.seek((d * s)/100)
            //console.log('Playing: ' + $scope.roteiro[i].arquivos[c].id + " | pan: " + $scope.roteiro[i].arquivos[c].channels[channel].pan + " | volume: " + $scope.roteiro[i].arquivos[c].channels[channel].volume);
          }
        }
      }
    }

    $scope.stopAudioFile = function(arquivo){
      for (var i = 0; i < $scope.roteiro.length; i++) {
        for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
          if($scope.roteiro[i].arquivos[c].url == arquivo.url){
            $scope.roteiro[i].arquivos[c].sound.stop();
            delete $scope.roteiro[i].arquivos[c].sound;
            $scope.roteiro[i].arquivos[c].playing = false;
            $scope.roteiro[i].arquivos[c].channels[channel].seek = 0;
            console.log('Finished: ' + $scope.roteiro[i].arquivos[c].id + " | playing: " + $scope.roteiro[i].arquivos[c].playing);
          }
        }
      }
    }

    $scope.updatePlayback = function(arquivo){
      for (var i = 0; i < $scope.roteiro.length; i++) {
        for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
          if($scope.roteiro[i].arquivos[c].url == arquivo.url){
            if(arquivo.channels[channel].seek){
              $scope.roteiro[i].arquivos[c].channels[channel].seek = arquivo.channels[channel].seek;
              var d = $scope.roteiro[i].arquivos[c].sound.duration();
              var s = $scope.roteiro[i].arquivos[c].channels[channel].seek;
              var v = $scope.roteiro[i].arquivos[c].sound.seek();
              $scope.roteiro[i].arquivos[c].sound.seek(s)
              console.log("seek: " + s);
            }
            if(arquivo.channels[channel].volume){
              $scope.roteiro[i].arquivos[c].channels[channel].volume = arquivo.channels[channel].volume;
              $scope.roteiro[i].arquivos[c].sound.volume($scope.roteiro[i].arquivos[c].channels[channel].volume/100);
              console.log("volume: " + $scope.roteiro[i].arquivos[c].sound.volume() + " | " + $scope.roteiro[i].arquivos[c].channels[channel].volume);
            }
            if(arquivo.channels[0].pan){
              $scope.roteiro[i].arquivos[c].channels[channel].pan = arquivo.channels[channel].pan;
              $scope.roteiro[i].arquivos[c].sound.stereo($scope.roteiro[i].arquivos[c].channels[channel].pan/100);
              console.log("pan: " + $scope.roteiro[i].arquivos[c].sound.stereo() + " | " + $scope.roteiro[i].arquivos[c].channels[channel].pan);
            }
            break;
          }
        }
      }
    }

  });
