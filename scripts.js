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

var coneBottomRadius = 0.2;
var coneTopRadius = 0.4;
var coneHeight = 0.6;
var coneRadialSubs = 10;
var coneVerticalSubs = 10;

var cubeBufferInfo = primitives.createCubeBufferInfo(gl, cubeSize);

var sphereBufferInfo = primitives.createSphereBufferInfo(
  gl,
  sphereRadius,
  sphereSubdivisionsAxis,
  sphereSubdivisionsHeight
);

var coneBufferInfo = primitives.createTruncatedConeBufferInfo(
  gl,
  coneBottomRadius,
  coneTopRadius,
  coneHeight,
  coneRadialSubs,
  coneVerticalSubs
);

function generateLabel(label) {
  var newLabel = document.createElement("p");
  newLabel.innerText = label;
  newLabel.className = "dropDownLabel";
  return newLabel;
}

function generateSlider(max, min, value) {
  var element = document.createElement("input");
  element.type = "range";
  element.className = "slider";
  element.setAttribute("min", min);
  element.setAttribute("max", max);
  element.setAttribute("value", value);
  return element;
}

function updateBufferInfo() {
  if (objectState == "cube") {
    // create buffers and fill with vertex data
    cubeBufferInfo = primitives.createCubeBufferInfo(gl, cubeSize);
  } else if (objectState == "sphere") {
    // SPHERE PARAMETERS: radius, subdivisionsAxis, subdivisionsHeight
    sphereBufferInfo = primitives.createSphereBufferInfo(
      gl,
      sphereRadius,
      sphereSubdivisionsAxis,
      sphereSubdivisionsHeight
    );
  } else if (objectState == "cone") {
    //CONE PARAMETERS: bottomRadius, topRadius, height, radialSubdivisions, verticalSubdivisions
    coneBufferInfo = primitives.createTruncatedConeBufferInfo(
      gl,
      coneBottomRadius,
      coneTopRadius,
      coneHeight,
      coneRadialSubs,
      coneVerticalSubs
    );
  }
}

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

  // bottomRadius, topRadius, height, radialSubdivisions, verticalSubdivisions
  var bottomRadiusLabel = generateLabel("Set bottom radius:");
  var topRadiusLabel = generateLabel("Set top radius:");
  var heightLabel = generateLabel("Set height of cone:");
  var radialSubsLabel = generateLabel("Set radial subdivisions:");
  var verticalSubsLabel = generateLabel("Set vertical subdivisions:");

  var bottomRadiusSlider = generateSlider(100, 10, coneBottomRadius * 100);
  bottomRadiusSlider.addEventListener("change", (e) => {
    coneBottomRadius = e.target.value / 100;
    updateBufferInfo();
  });

  var topRadiusSlider = generateSlider(100, 10, coneTopRadius * 100);
  topRadiusSlider.addEventListener("change", (e) => {
    coneTopRadius = e.target.value / 100;
    updateBufferInfo();
  });

  var coneHeightSlider = generateSlider(100, 10, coneHeight * 100);
  coneHeightSlider.addEventListener("change", (e) => {
    coneHeight = e.target.value / 100;
    updateBufferInfo();
  });

  var coneRadialSubsSlider = generateSlider(50, 4, coneRadialSubs);
  coneRadialSubsSlider.addEventListener("change", (e) => {
    coneRadialSubs = e.target.value;
    updateBufferInfo();
  });

  var coneVerticalSubsSlider = generateSlider(50, 4, coneVerticalSubs);
  coneVerticalSubsSlider.addEventListener("change", (e) => {
    coneVerticalSubs = e.target.value;
    updateBufferInfo();
  });
  // bottomRadius, topRadius, height, radialSubdivisions, verticalSubdivisions
  div.appendChild(bottomRadiusLabel);
  div.appendChild(bottomRadiusSlider);
  div.appendChild(topRadiusLabel);
  div.appendChild(topRadiusSlider);
  div.appendChild(heightLabel);
  div.appendChild(coneHeightSlider);
  div.appendChild(radialSubsLabel);
  div.appendChild(coneRadialSubsSlider);
  div.appendChild(verticalSubsLabel);
  div.appendChild(coneVerticalSubsSlider);
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
    const image = new Image();
    image.src = url;

    image.addEventListener("load", function () {
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
    gl.depthFunc(gl.LESS);
    gl.useProgram(envmapProgramInfo.program);
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
