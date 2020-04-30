"use strict";

var backgroundState = "bridge";
var objectState = "cube";

function setObject(shape) {
  console.log(shape);
  objectState = shape;
}

function setBackground(background) {
  if (background != backgroundState) {
    backgroundState = background;
    main();
  }
}

function createEnvironment() {}

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
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

  // create buffers and fill with vertex data
  const cubeBufferInfo = primitives.createCubeBufferInfo(gl, 1);

  // SPHERE PARAMETERS: radius, subdivisionsAxis, subdivisionsHeight
  const sphereBufferInfo = primitives.createSphereBufferInfo(gl, 0.5, 10, 10);

  //CONE PARAMETERS: bottomRadius, topRadius, height, radialSubdivisions, verticalSubdivisions
  const coneBufferInfo = primitives.createTruncatedConeBufferInfo(
    gl,
    0.2,
    0.4,
    0.6,
    10,
    10
  );
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
    const width = 2048;
    const height = 2048;
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
      Math.cos(time * 0.1) * 2,
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

    // We only care about direciton so remove the translation
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

    if (objectState == "cube") {
      webglUtils.drawBufferInfo(gl, cubeBufferInfo);
    } else if (objectState == "sphere") {
      webglUtils.drawBufferInfo(gl, sphereBufferInfo);
    } else if (objectState == "cone") {
      webglUtils.drawBufferInfo(gl, coneBufferInfo);
    }

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

    requestAnimationFrame(drawScene);
  }
}

main();
