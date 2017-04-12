//  SlideDrop.js - Daniel Smith - created from the draggable cubes exaample
//
var container;
var camera, controls, scene, projector, raycaster, renderer;
var objects = [], plane;

var mouse = new THREE.Vector2(),

lastMouse = new THREE.Vector2(),
offset = new THREE.Vector3(), INTERSECTED, SELECTED;


var getImageServerAddress = "http://daniel.org/SlideDrop/lib/getImage.php";
var defaultImage = location.protocol + "//" + location.host + "/images/water.jpg";

console.log(defaultImage);
console.log(location);

init();
animate();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 1000;

  controls = new THREE.TrackballControls( camera );
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  lastMouse.x = 0;
  lastMouse.y = 0;

  scene = new THREE.Scene();

  scene.add( new THREE.AmbientLight( 0x505050 ) );

  var light = new THREE.SpotLight( 0xffffff, 1.5 );
  light.position.set( 0, 500, 2000 );
  light.castShadow = true;

  light.shadowCameraNear = 200;
  light.shadowCameraFar = camera.far;
  light.shadowCameraFov = 50;

  light.shadowBias = -0.00022;
  light.shadowDarkness = 0.5;

  light.shadowMapWidth = 2048;
  light.shadowMapHeight = 2048;

  scene.add( light );

  var geometry = new THREE.CubeGeometry( 40, 40, 40 );

  for ( var i = 0; i < 20; i ++ ) {

    var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( {
      map:  new THREE.ImageUtils.loadTexture(defaultImage)
              //color: Math.random() * 0xffffff 
            } ) );

    object.material.ambient = object.material.color;

    object.position.x = Math.random() * 1000 - 500;
    object.position.y = Math.random() * 600 - 300;
    object.position.z = Math.random() * 800 - 400;

    object.scale.x = 2;
    object.scale.y = 2;
    object.scale.z = 0.1;


    object.slideData = {};
    object.slideData.cursor = 0;
    object.slideData.images = [];
    object.slideData.aspects = [];

    object.castShadow = true;
    object.receiveShadow = true;

    scene.add( object );

    objects.push( object );
  }

  plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
  plane.visible = false;
  scene.add( plane );

  projector = new THREE.Projector();
  raycaster = new THREE.Raycaster();

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.sortObjects = false;
  renderer.setSize( window.innerWidth, window.innerHeight );

  renderer.shadowMapEnabled = true;
  renderer.shadowMapType = THREE.PCFShadowMap;

  container.appendChild( renderer.domElement );

  var info = document.createElement( 'div' );
  info.style.position = 'absolute';
  info.style.top = '10px';
  info.style.width = '100%';
  info.style.textAlign = 'center';
  info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> webgl - SlideDrop';
  container.appendChild( info );

  renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
  renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
  renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

  renderer.domElement.addEventListener('drop', onDrop, true );

  renderer.domElement.addEventListener('dragover', onOver, false );
  renderer.domElement.addEventListener( 'dragenter', onDocumentMouseEnter, false );


  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}



function handleOnLoad(event) {

  console.log(this.src);
  window.URL.revokeObjectURL(this.src);

  var  aspect = (this.width / this.height);

  console.log(this.width);
  console.log(this.height);

  tex = new THREE.Texture(this);
  tex.needsUpdate = true;

  LASTINTERSECTED.material.map = tex;
  LASTINTERSECTED.material.needsUpdate = true;
  LASTINTERSECTED.scale.x = aspect;
  LASTINTERSECTED.scale.y = 2;
  LASTINTERSECTED.slideData.images.push(tex);
  LASTINTERSECTED.slideData.aspects.push(aspect);
}



function onOver(event) {

  if (event.preventDefault) event.preventDefault();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  return false;
}


function onDrop(event) {
  var src;

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  var curReaders = [];
  var curFiles = [];
  var curImages = [];
  var url = window.URL || window.webkitURL;

  if (event.preventDefault) {
    event.preventDefault();
    event.stopPropagation();

    src = '';

    // can we get an image out of this??
    // kudos to Remy Sharp - http://html5demos.com/drag-anything
    if (event.dataTransfer.types) {
      [].some.call(event.dataTransfer.types, function (type) {
        if (type == "text/plain") {
          src = event.dataTransfer.getData("Text");
        } else if (type == "Files") {
            var files = event.dataTransfer.files; // FileList object.

            console.dir(files);

            for (var i = 0, f; f = files[i]; i++) {
            curFiles[i] = event.dataTransfer.files[i];
            curImages[i] = new Image();
            curImages[i].src = window.URL.createObjectURL(curFiles[i]);
            curImages[i].onload = handleOnLoad;
          }
        } else {
          $('#dataXferDiv').html(event.dataTransfer.getData(type));

          var theImage = $('#dataXferDiv img').attr('src');

          if (typeof theImage !== "undefined") {
            src = theImage;
          }
        }

        // break out of this loop;
        if (src != '') {
          console.log(src);

          return true;
        }
      });
    }

  } else {
    return false;
  }

    $.getImageData({
      url: src,
      server: getImageServerAddress,

      success: function(image){
        var aspect;

        var docimg =  new Image();
        docimg.src = image.src;
        aspect = 4 * (docimg.width / docimg.height);
        tex = new THREE.Texture(docimg);
        tex.needsUpdate = true;
    
        var geometry = new THREE.CubeGeometry( 40, 40, 40 );

        // lets make a new object
        if (LASTINTERSECTED != INTERSECTED) { 
          var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ 
            map:  tex
          }));

          object.position.x = (mouse.x * 100) - 50;
          object.position.y = (mouse.y * 100) - 50;
          object.position.z = -100;

          object.slideData = {};
          object.slideData.images = [];
          object.slideData.aspects = [];

          object.slideData.cursor = 0;
          object.slideData.images.push(tex);
          object.slideData.aspects.push(aspect);


          object.scale.x = aspect;
          object.scale.y = 2;
          object.scale.z = 0.25;

          objects.push( object );

          scene.add( object );

        } else {
          // update an existing slideshow object
          LASTINTERSECTED.material.map = tex;
          LASTINTERSECTED.material.needsUpdate = true;
          LASTINTERSECTED.scale.x = aspect;
          LASTINTERSECTED.slideData.images.push(tex);
          LASTINTERSECTED.slideData.aspects.push(aspect);
        }
      },
      error: function(xhr, text_status){
        // Handle your error here
      }
    });

  return false;
}



function onDocumentMouseEnter( event ) {
  event.preventDefault();
  return false;
}


function onDocumentMouseMove( event ) {

  event.preventDefault();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );

  projector.unprojectVector( vector, camera );
  var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );


  if ( SELECTED ) {
    var intersects = raycaster.intersectObject( plane );
    SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );
    return;

  }


  var intersects = raycaster.intersectObjects( objects );

  if ( intersects.length > 0 ) {

    if ( INTERSECTED != intersects[ 0 ].object ) {

      if ( INTERSECTED ) INTERSECTED.material.color.setHex( 0xffffff ) ; // INTERSECTED.currentHex );

      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

      LASTINTERSECTED = INTERSECTED;

      INTERSECTED.material.color.setHex( 0x00ff00 );

      plane.position.copy( INTERSECTED.position );
      plane.lookAt( camera.position );

    }

    container.style.cursor = 'pointer';

  } else {

    if ( INTERSECTED ) INTERSECTED.material.color.setHex( 0xffffff ) ; //INTERSECTED.currentHex );

    INTERSECTED = null;

    container.style.cursor = 'auto';

  }
}



function getNextImage(object) {
  var retVal = {};

  if (object.slideData && object.slideData.images.length > 0) {

    if (object.slideData.cursor < (object.slideData.images.length - 1)) {
      object.slideData.cursor++;
    } else {
      object.slideData.cursor = 0;
    }

    retVal['image'] = object.slideData.images[object.slideData.cursor];
    retVal['aspect'] = object.slideData.aspects[object.slideData.cursor];
  }

  return retVal;
}

function getPrevImage(object) {
  var retVal = {};

  if (object.slideData && object.slideData.images.length > 0) {

    if (object.slideData.cursor > 0) {
      object.slideData.cursor--;
    } else {
      object.slideData.cursor = object.slideData.images.length - 1;
    }

    retVal['image'] = object.slideData.images[object.slideData.cursor];
    retVal['aspect'] = object.slideData.aspects[object.slideData.cursor];
  }

  return retVal;
}



function updateSlide(object, imageData) {

  console.log('in updateSlide');
  console.dir(object);
  //console.log(image);


  var aspect = imageData['aspect'];
  object.material.map = imageData['image'];
  object.material.needsUpdate = true;
  object.scale.x = aspect;
}


function onDocumentMouseDown( event ) {

  event.preventDefault();

  var curImage = {};

  var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
  projector.unprojectVector( vector, camera );

  var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

  var intersects = raycaster.intersectObjects( objects );


  if ( intersects.length > 0 ) {

    controls.enabled = false;
    SELECTED = intersects[ 0 ].object;

    var w2l = SELECTED.worldToLocal( intersects[0].point );

    var w2lX = w2l.x / SELECTED.slideData.aspects[SELECTED.slideData.cursor];

    // click towards right edge
    if (w2lX >= 5) {
      curImage = getNextImage(INTERSECTED);
    }

    // click towards left edge
    if (w2lX <= -5) {
      curImage = getPrevImage(INTERSECTED);
    }

    console.dir(curImage);

    if (event.ctrlKey) {
      // rotate
      rotX = event.clientX - lastMouse.x;
      rotX <= 0 ? -rotX : rotX;

      SELECTED.rotation.x += rotX;

      console.log(rotX);
    } else  if (typeof curImage['image'] !== "undefined") {
      updateSlide(INTERSECTED, curImage);
    }

    var intersects = raycaster.intersectObject( plane );

    console.log('x ' + intersects[0].point.x);
    console.log('y ' + intersects[0].point.y);
    console.dir(intersects[0].object);
    console.log(w2l.x);
    console.log(w2l.y);
    offset.copy( intersects[ 0 ].point ).sub( plane.position );

    lastMouse.x = event.clientX
    lastMouse.y = event.clientY;

    container.style.cursor = 'move';
  }

}

function onDocumentMouseUp( event ) {

  event.preventDefault();

  controls.enabled = true;

  SELECTED = null;

  if ( INTERSECTED ) {

//    plane.position.copy( INTERSECTED.position );

    SELECTED = null;
  }

  container.style.cursor = 'auto';

}

//

function animate() {

  requestAnimationFrame( animate );

  render();
}


function render() {

  controls.update();

  var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
  projector.unprojectVector( vector, camera );

  raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

  var intersects = raycaster.intersectObjects( objects );

  // LASTINTERSECTED is used to keep track of what object is "active"
  // if it is null, then we know to make a new object ... as we would be
  // dropping into a free spot on the scene

  if ( intersects.length > 0 ) {
    if ( INTERSECTED != intersects[ 0 ].object ) {


      if ( INTERSECTED ) {
          INTERSECTED.material.emissive.setHex( 0xffffff) ; //INTERSECTED.currentHex );
      }

      INTERSECTED = intersects[ 0 ].object;

      LASTINTERSECTED = INTERSECTED;

      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex( 0xff0000 );
    }
  } else {

    if ( INTERSECTED )
        INTERSECTED.material.emissive.setHex( 0xffffff ); //INTERSECTED.currentHex );

    INTERSECTED = null;

  }


  renderer.render( scene, camera );

}

