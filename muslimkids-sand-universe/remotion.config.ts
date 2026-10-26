import {Config} from '@remotion/cli/config';

// Software WebGL (ANGLE on SwiftShader) renders the instanced sand
// deterministically on machines without a GPU.
Config.setChromiumOpenGlRenderer('swangle');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setConcurrency(2);
