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
           $scope.roteiro[i].arquivos[c].seek = 0;
           $scope.roteiro[i].arquivos[c].surround_x = 0;
           $scope.roteiro[i].arquivos[c].surround_y = 0;
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
              volume: ($scope.roteiro[i].arquivos[c].volume/100),
              stereo: $scope.roteiro[i].arquivos[c].pan,
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

    $scope.playAudioFile = function(arquivo){

      for (var i = 0; i < $scope.roteiro.length; i++) {
        for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
          if($scope.roteiro[i].arquivos[c].url == arquivo.url){
            $scope.roteiro[i].arquivos[c].volume = parseInt(arquivo.volume);
            $scope.roteiro[i].arquivos[c].pan = parseInt(arquivo.pan);
            $scope.roteiro[i].arquivos[c].seek = parseInt(arquivo.seek);
            console.log($scope.roteiro[i].arquivos[c])
            if($scope.roteiro[i].arquivos[c].sound) {
              $scope.roteiro[i].arquivos[c].sound.volume($scope.roteiro[i].arquivos[c].volume/100);
              $scope.roteiro[i].arquivos[c].sound.stereo($scope.roteiro[i].arquivos[c].pan/100);
              $scope.roteiro[i].arquivos[c].sound.stop();
              $scope.roteiro[i].arquivos[c].sound.play();
            } else {
              var sound = new Howl({
                //usingWebAudio: true,
                //html5: false,
                src: [$scope.roteiro[i].arquivos[c].url],
                autoplay: false,
                loop: $scope.roteiro[i].arquivos[c].loop,
                volume: ($scope.roteiro[i].arquivos[c].volume/100),
                stereo: $scope.roteiro[i].arquivos[c].pan,
                onend: function(id) {
                  for (var i = 0; i < $scope.roteiro.length; i++) {
                    for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
                      if($scope.roteiro[i].arquivos[c].id == id){
                        $scope.roteiro[i].arquivos[c].playing = false;
                        $scope.roteiro[i].arquivos[c].seek = 0;
                        console.log('Finished: ' + id + " | playing: " + $scope.roteiro[i].arquivos[c].playing);
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
            var s = $scope.roteiro[i].arquivos[c].seek;
            $scope.roteiro[i].arquivos[c].sound.seek((d * s)/100)
            console.log('Playing: ' + $scope.roteiro[i].arquivos[c].id + " | pan: " + $scope.roteiro[i].arquivos[c].pan + " | volume: " + $scope.roteiro[i].arquivos[c].volume);
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
            $scope.roteiro[i].arquivos[c].seek = 0;
            console.log('Finished: ' + $scope.roteiro[i].arquivos[c].id + " | playing: " + $scope.roteiro[i].arquivos[c].playing);
          }
        }
      }
    }

    $scope.updatePlayback = function(arquivo){
      for (var i = 0; i < $scope.roteiro.length; i++) {
        for (var c = 0; c < $scope.roteiro[i].arquivos.length; c++) {
          if($scope.roteiro[i].arquivos[c].url == arquivo.url){
            if(arquivo.seek){
              $scope.roteiro[i].arquivos[c].seek = arquivo.seek;
              var d = $scope.roteiro[i].arquivos[c].sound.duration();
              var s = $scope.roteiro[i].arquivos[c].seek;
              var v = $scope.roteiro[i].arquivos[c].sound.seek();
              $scope.roteiro[i].arquivos[c].sound.seek(s)
              console.log("seek: " + s);
            }
            if(arquivo.volume){
              $scope.roteiro[i].arquivos[c].volume = arquivo.volume;
              $scope.roteiro[i].arquivos[c].sound.volume($scope.roteiro[i].arquivos[c].volume/100);
              console.log("volume: " + $scope.roteiro[i].arquivos[c].sound.volume() + " | " + $scope.roteiro[i].arquivos[c].volume);
            }
            if(arquivo.pan){
              $scope.roteiro[i].arquivos[c].pan = arquivo.pan;
              $scope.roteiro[i].arquivos[c].sound.stereo($scope.roteiro[i].arquivos[c].pan/100);
              console.log("pan: " + $scope.roteiro[i].arquivos[c].sound.stereo() + " | " + $scope.roteiro[i].arquivos[c].pan);
            }
            break;
          }
        }
      }
    }

  });
