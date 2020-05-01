"use strict";
var canvas = document.querySelector("#canvas");
var gl = canvas.getContext("webgl");

var backgroundState = "bridge";
var objectState = "cube";
var cameraRotation = 1;
var running = true;

var cubeSize = 0.4;

var sphereRadius = 0.5;
var sphereSubdivisionsAxis = 50;
var sphereSubdivisionsHeight = 50;

// create buffers and fill with vertex data
var cubeBufferInfo = primitives.createCubeBufferInfo(gl, cubeSize);

// SPHERE PARAMETERS: radius, subdivisionsAxis, subdivisionsHeight
var sphereBufferInfo = primitives.createSphereBufferInfo(
  gl,
  sphereRadius,
  sphereSubdivisionsAxis,
  sphereSubdivisionsHeight
);

//CONE PARAMETERS: bottomRadius, topRadius, height, radialSubdivisions, verticalSubdivisions
var coneBufferInfo = primitives.createTruncatedConeBufferInfo(
  gl,
  0.2,
  0.4,
  0.6,
  10,
  10
);

function createCubePanel() {
  const div = document.getElementById("sliderPanel");
  div.innerHTML = "";
  var cubeLabel = document.createElement("p");
  cubeLabel.innerText = "Set Cube size: ";
  cubeLabel.className = "dropDownLabel";
  var node = document.createElement("input");
  node.type = "range";
  node.className = "slider";
  node.setAttribute("min", 10);
  node.setAttribute("max", 100);
  node.setAttribute("value", cubeSize * 100);
  node.addEventListener("change", (e) => {
    cubeSize = e.target.value / 100;
    cubeBufferInfo = primitives.createCubeBufferInfo(gl, cubeSize);
  });

  div.appendChild(cubeLabel);
  div.appendChild(node);
}

function createSpherePanel() {
  const div = document.getElementById("sliderPanel");
  div.innerHTML = "";

  var sphereRadiusLabel = document.createElement("p");
  sphereRadiusLabel.innerText = "Set Sphere Radius: ";
  sphereRadiusLabel.className = "dropDownLabel";

  var sphereRadiusSlider = document.createElement("input");
  sphereRadiusSlider.type = "range";
  sphereRadiusSlider.className = "slider";
  sphereRadiusSlider.setAttribute("min", 10);
  sphereRadiusSlider.setAttribute("max", 100);
  sphereRadiusSlider.setAttribute("value", sphereRadius * 100);
  sphereRadiusSlider.addEventListener("change", (e) => {
    sphereRadius = event.target.value / 100;

    sphereBufferInfo = primitives.createSphereBufferInfo(
      gl,
      sphereRadius,
      sphereSubdivisionsAxis,
      sphereSubdivisionsHeight
    );
  });

  var sphereSubdivisionsAxisLabel = document.createElement("p");
  sphereSubdivisionsAxisLabel.innerText =
    "Set number of subdivisions on axis: ";
  sphereSubdivisionsAxisLabel.className = "dropDownLabel";

  var sphereSubdivisionsSlider = document.createElement("input");
  sphereSubdivisionsSlider.type = "range";
  sphereSubdivisionsSlider.className = "slider";
  sphereSubdivisionsSlider.setAttribute("min", 4);
  sphereSubdivisionsSlider.setAttribute("max", 50);
  sphereSubdivisionsSlider.setAttribute("value", sphereSubdivisionsAxis);

  sphereSubdivisionsSlider.addEventListener("change", (e) => {
    sphereSubdivisionsAxis = parseInt(e.target.value);
    sphereBufferInfo = primitives.createSphereBufferInfo(
      gl,
      sphereRadius,
      sphereSubdivisionsAxis,
      sphereSubdivisionsHeight
    );
  });

  var sphereSubdivisionsHeightLabel = document.createElement("p");
  sphereSubdivisionsHeightLabel.innerText = "Set height of subdivisions: ";
  sphereSubdivisionsHeightLabel.className = "dropDownLabel";

  var sphereSubdivisionsHeightSlider = document.createElement("input");
  sphereSubdivisionsHeightSlider.type = "range";
  sphereSubdivisionsHeightSlider.className = "slider";
  sphereSubdivisionsHeightSlider.setAttribute("min", 4);
  sphereSubdivisionsHeightSlider.setAttribute("max", 50);
  sphereSubdivisionsHeightSlider.setAttribute(
    "value",
    sphereSubdivisionsHeight
  );

  sphereSubdivisionsHeightSlider.addEventListener("change", (e) => {
    sphereSubdivisionsHeight = parseInt(e.target.value);
    sphereBufferInfo = primitives.createSphereBufferInfo(
      gl,
      sphereRadius,
      sphereSubdivisionsAxis,
      sphereSubdivisionsHeight
    );
  });

  div.appendChild(sphereRadiusLabel);
  div.appendChild(sphereRadiusSlider);
  div.appendChild(sphereSubdivisionsAxisLabel);
  div.appendChild(sphereSubdivisionsSlider);
  div.appendChild(sphereSubdivisionsHeightLabel);
  div.appendChild(sphereSubdivisionsHeightSlider);
}

function createConePanel() {
  const div = document.getElementById("sliderPanel");
  div.innerHTML = "";

  var coneLabel = document.createElement("p");
  coneLabel.innerText = "TODO: Options for cone";
  coneLabel.className = "dropDownLabel";

  div.appendChild(coneLabel);
}

function setObject(selectObject) {
  if (selectObject.value == "cube") {
    createCubePanel();
  } else if (selectObject.value == "sphere") {
    createSpherePanel();
  } else {
    createConePanel();
  }

  console.log(selectObject.value);
  objectState = selectObject.value;
}

function setBackground(selectObject) {
  if (selectObject.value != backgroundState) {
    backgroundState = selectObject.value;
    main();
  }
}

function setCameraRotation(rotation) {
  if (rotation === "clockwise") {
    cameraRotation = 1;
  }
  if (rotation === "anti-clockwise") {
    cameraRotation = -1;
  }
}

function setRunning(runningInput) {
  if (runningInput === "stop") {
    running = false;
  }
  if (runningInput === "start") {
    running = true;
    main();
  }
}

function drawObject(gl, bufferInfo) {
  if (objectState == "cube") {
    webglUtils.drawBufferInfo(gl, cubeBufferInfo);
  } else if (objectState == "sphere") {
    webglUtils.drawBufferInfo(gl, sphereBufferInfo);
  } else if (objectState == "cone") {
    webglUtils.drawBufferInfo(gl, coneBufferInfo);
  }
}

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */

  if (!gl) {
    return;
  }

  function requestCORSIfNotSameOrigin(img, url) {
    if (new URL(url).origin !== window.location.origin) {
      img.crossOrigin = "";
    }
  }

  // setup GLSL programs and lookup locations
  const envmapProgramInfo = webglUtils.createProgramInfo(gl, [
    "envmap-vertex-shader",
    "envmap-fragment-shader",
  ]);

  const skyboxProgramInfo = webglUtils.createProgramInfo(gl, [
    "skybox-vertex-shader",
    "skybox-fragment-shader",
  ]);

  const quadBufferInfo = primitives.createXYQuadBufferInfo(gl);

  // Create a texture.
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

  var faceInfos = [
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      url: `images/${backgroundState}/posx.jpg`,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      url: `images/${backgroundState}/negx.jpg`,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      url: `images/${backgroundState}/posy.jpg`,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      url: `images/${backgroundState}/negy.jpg`,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      url: `images/${backgroundState}/posz.jpg`,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      url: `images/${backgroundState}/negz.jpg`,
    },
  ];

  faceInfos.forEach((faceInfo) => {
    const { target, url } = faceInfo;

    // Upload the canvas to the cubemap face.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1024;
    const height = 1024;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    // setup each face so it's immediately renderable
    gl.texImage2D(
      target,
      level,
      internalFormat,
      width,
      height,
      0,
      format,
      type,
      null
    );

    // Asynchronously load an image
    const image = new Image();

    //requestCORSIfNotSameOrigin(image, url);
    image.src = url;

    image.addEventListener("load", function () {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
      gl.texImage2D(target, level, internalFormat, format, type, image);
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    });
  });
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  gl.texParameteri(
    gl.TEXTURE_CUBE_MAP,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_LINEAR
  );

  function radToDeg(r) {
    return (r * 180) / Math.PI;
  }

  function degToRad(d) {
    return (d * Math.PI) / 180;
  }

  var fieldOfViewRadians = degToRad(60);
  var cameraYRotationRadians = degToRad(0);

  var spinCamera = true;
  // Get the starting time.
  var then = 0;

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(time) {
    // convert to seconds
    time *= 0.001;
    // Subtract the previous time from the current time
    var deltaTime = time - then;
    // Remember the current time for the next frame.
    then = time;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // camera going in circle 2 units from origin looking at origin
    var cameraPosition = [
      Math.cos(time * 0.1) * 2 * cameraRotation,
      0,
      Math.sin(time * 0.1) * 2,
    ];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    // Compute the camera's matrix using look at.
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    // Rotate the cube around the x axis
    var worldMatrix = m4.xRotation(time * 0.11);

    // We only care about direction so remove the translation
    var viewDirectionMatrix = m4.copy(viewMatrix);
    viewDirectionMatrix[12] = 0;
    viewDirectionMatrix[13] = 0;
    viewDirectionMatrix[14] = 0;

    var viewDirectionProjectionMatrix = m4.multiply(
      projectionMatrix,
      viewDirectionMatrix
    );
    var viewDirectionProjectionInverseMatrix = m4.inverse(
      viewDirectionProjectionMatrix
    );

    // draw the cube
    gl.depthFunc(gl.LESS); // use the default depth test
    gl.useProgram(envmapProgramInfo.program);
    //webglUtils.setBuffersAndAttributes(gl, envmapProgramInfo, cubeBufferInfo);
    if (objectState == "cube") {
      webglUtils.setBuffersAndAttributes(gl, envmapProgramInfo, cubeBufferInfo);
    } else if (objectState == "sphere") {
      webglUtils.setBuffersAndAttributes(
        gl,
        envmapProgramInfo,
        sphereBufferInfo
      );
    } else if (objectState == "cone") {
      webglUtils.setBuffersAndAttributes(gl, envmapProgramInfo, coneBufferInfo);
    }

    webglUtils.setUniforms(envmapProgramInfo, {
      u_world: worldMatrix,
      u_view: viewMatrix,
      u_projection: projectionMatrix,
      u_texture: texture,
      u_worldCameraPosition: cameraPosition,
    });

    drawObject(gl);

    // draw the skybox

    // let our quad pass the depth test at 1.0
    gl.depthFunc(gl.LEQUAL);

    gl.useProgram(skyboxProgramInfo.program);
    webglUtils.setBuffersAndAttributes(gl, skyboxProgramInfo, quadBufferInfo);
    webglUtils.setUniforms(skyboxProgramInfo, {
      u_viewDirectionProjectionInverse: viewDirectionProjectionInverseMatrix,
      u_skybox: texture,
    });
    webglUtils.drawBufferInfo(gl, quadBufferInfo);

    if (running) {
      requestAnimationFrame(drawScene);
    }
  }
}

main();
createCubePanel();
