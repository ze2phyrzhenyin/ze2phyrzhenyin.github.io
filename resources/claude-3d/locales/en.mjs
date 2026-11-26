// English text. Same shape as zh.mjs, plus the catalogue entries that zh keeps in ../catalog.mjs.
// Straight apostrophes are fine here: build.mjs sets the typographic ones.
export default {
  htmlLang: 'en',
  title: 'Making 3D video with Claude',
  description: 'Learn how a 3D shot is built from a Blender camera file, and look up tools, examples and render estimates.',
  titleJoin: ' | ',
  descriptionJoin: '. ',
  chrome: {
    skip: 'Skip to content', hub: 'All guides', brand: 'Video handbook', nav: 'Guide sections', languages: 'Language',
    theme: 'Switch colour theme', themeLabel: 'Theme', references: 'References'
  },
  pages: {
    home: {nav: 'Routes', title: 'Routes'},
    tools: {nav: 'Tools', title: 'Tool comparison'},
    cases: {nav: 'Examples', title: 'Examples'},
    estimate: {nav: 'Estimates', title: 'Usage estimates'},
    handbook: {nav: 'Handbook', title: 'Project handbook'}
  },
  common: {download: 'Download the Blender file', study: 'Twin-lens camera study'},
  home: {
    h1: '3D video<br> with Claude',
    intro: 'Start with this twin-lens camera. Open the scene, move the camera or swap in another set of lights, and watch how they change the same shot.',
    sample: 'Watch the 3-second sample',
    alt: 'Dark green twin-lens camera rendered in Blender with its materials',
    viewsLabel: 'Switch render view',
    views: {studio: 'Materials', clay: 'Clay', detail: 'Lens detail'},
    routesTitle: 'Choose a route by deliverable',
    routesLabel: 'Deliverable',
    routes: {
      native: ['Editable scene', 'Blender scene', 'Keep the models, cameras and materials in one file. When the client wants a different focal length or reflection, you re-render only the shots concerned.'],
      code: ['Video template', 'Remotion template', 'Turn the copy, colours and aspect ratio into parameters. The intro timeline can be reused, and each language version is exported on its own.'],
      video: ['Generated clips', 'Video from reference images', 'Keep one fixed reference image of the subject, then write the action and framing for each shot separately. Keep the candidate clips and arrange them in an editor.']
    },
    related: 'See the related tools',
    adviser: 'Refine by subject and hardware',
    subject: 'Subject',
    subjects: {product: 'Physical product', ui: 'Software interface', scene: 'Architecture or environment', story: 'Characters or story'},
    machine: 'Hardware',
    machines: {laptop: 'Ordinary laptop', mac: 'Apple Silicon Mac', gpu: 'Discrete GPU or render machine'}
  },
  tools: {
    search: 'Search tools', searchPlaceholder: 'Name, use or setup', category: 'Category', allCategories: 'All categories',
    viewComparison: 'View comparison', compare: 'Compare', compareAria: 'Compare {name}', details: 'Limits and setup',
    limit: 'Limits', setup: 'Setup', none: 'No tools match these filters.', reset: 'Clear filters',
    selected: 'Selected tools', clear: 'Clear comparison', hint: 'Tick tools in the list to compare up to three.'
  },
  cases: {
    videoLabel: 'Orbit shot around the twin-lens camera, silent, 3 seconds',
    spec: 'Blender 5.2 · 24 fps · 72 frames',
    text: 'The camera orbits 48 degrees around the body. Pause on the frame where the highlight on the lens is strongest, open the file, move the area light at front left and compare the reflections on the lens.',
    openVideo: 'Open the video',
    exercise: 'Change this shot with Claude',
    exerciseIntro: 'Give this request and the name of the file to a Claude that can operate Blender.',
    exercisePrompt: 'Open twin-66.blend and go to frame 48. Move the Key strip area light half a Blender unit to the left, keeping it aimed at the centre of the camera body. Render one image before the change and one after, and compare the highlight on the upper lens. Save the modified scene as twin-light.blend.',
    worksTitle: 'Films and technical demos',
    type: 'Example type',
    allTypes: 'All types'
  },
  estimate: {
    index: 'Estimate types',
    pricePlaceholder: 'Unit price',
    calculators: {
      render: {
        title: 'Render time',
        intro: 'Enter the measured time for one frame on the target machine.',
        fields: {seconds: 'Duration (seconds)', fps: 'Frame rate (fps)', per: 'Time per frame (seconds)'},
        note: 'The frame count is rounded up, then multiplied by the time per frame. The result assumes one machine rendering without a break.',
        source: 'Blender animation output'
      },
      quota: {
        title: 'Subscription usage',
        intro: 'Record the difference in usage before and after one trial, within the same limit window.',
        fields: {percent: 'Trial usage (%)', tested: 'Shots in the trial', shots: 'Shots planned'},
        note: 'Trial usage × shots planned ÷ shots in the trial. Valid only for tasks with a similar model, context and complexity.',
        source: 'Claude usage limits'
      },
      api: {
        title: 'API cost',
        intro: 'Take the unit prices from the price list of the model you use. Amounts are in US dollars.',
        fields: {input: 'Input tokens', output: 'Output tokens', inprice: 'Input price ($ per million tokens)', outprice: 'Output price ($ per million tokens)'},
        note: 'Input and output tokens are each multiplied by their unit price, then divided by one million. Caching, batch discounts and credits for external video services are counted separately.',
        source: 'Anthropic price list'
      }
    }
  },
  handbook: {
    index: 'Handbook sections',
    workflow: 'From storyboard to delivery',
    prompt: 'Developer-kit prompt',
    sources: 'References',
    steps: [
      ['Write down the delivery requirements', 'Note the running time, frame rate, aspect ratio and audio requirements. If the 3D source files are to be delivered, also agree on the software version and on how external assets are packed.'],
      ['Sketch out the main shots', "Give each shot one line stating its start and end frames, the subject's movement and the camera's movement. Put the product dimensions, reference images and logo files in the asset list."],
      ['Test the hardest section', 'Take the hardest 3 to 5 seconds and make a sample. Check outlines and occlusion on a clay render, and reflections in Material Preview. Record the render time for one frame and the peak VRAM.'],
      ['Output frame by frame', "Render each shot as consecutively numbered images. After a failure, render the missing frames again, and keep the project's frame rate when assembling. Check subtitle line breaks and audio cut points in the final aspect ratio."],
      ['Review and deliver', 'Watch the whole video once, looking for flicker, meshes passing through each other and the loudness after each cut. Open the source project from another folder and check the textures, fonts, asset licences and output settings.']
    ],
    assemble: "Assemble the sample file's image sequence into an MP4",
    assembleText: 'In Blender, choose Render Animation. A frames folder appears next to the file. Run the command below from the folder that contains the file.',
    ffmpegDocs: 'FFmpeg image sequence documentation',
    modelsTitle: 'Dividing work between Claude models',
    modelsText: 'When several shots have to be planned at once or a render error tracked down, Opus can break the work down. Once the template is settled, swapping subtitles, changing parameters and tidying scripts can go to Sonnet. Try one shot first, then choose the model from the measured time and usage.',
    promptIntro: "Write this shoot's conditions at the top of the prompt and hand it to Claude together with the storyboard, assets, and render and delivery requirements.",
    brief: [
      ['Project', 'Twin-lens camera presentation'],
      ['Hardware and system', 'MacBook Pro, 18 GB'],
      ['Budget', 'No more than 10 euros on external services'],
      ['Delivery', '20 seconds, 1080p, with the editable project']
    ],
    copy: 'Copy the prompt',
    download: 'Download TXT',
    fullPrompt: 'Read the full prompt',
    original: 'Download the original prompt',
    references: ['Blender animation output', 'ThreeCanvas in Remotion', 'FFmpeg image sequences', 'Poly Haven asset licence', 'Claude subscription usage limits', 'Anthropic API pricing', 'Claude models overview'],
    elsewhere: "Source code for the production plugins is listed under {tools}, and their authors' demos under {cases}."
  },
  catalog: {
    categories: {native: '3D software and connectors', code: 'Animation in code', skill: 'Production Skills', asset: 'Assets and output', video: 'Generated video'},
    caseTypes: {film: 'Finished films', template: 'Templates and samples', demo: 'Technical demos'},
    // Tool name: [use, limit, setup]
    tools: {
      'Blender': ['Modelling, lighting and rendering, delivered as a .blend file that can still be edited.', 'Render time per frame depends on the scene, the sampling and the hardware.', 'Set up cameras and keyframes in Python and output an image sequence.'],
      'Blender MCP': ['Inspect or change the open Blender scene from Claude.', 'Shot design and render settings still have to be written into the file.', 'Enable the matching extension in Blender, then connect an MCP client.'],
      'mcp-for-blender': ['Community-maintained Blender connector, with examples of bringing in models and environment assets.', 'The connector can execute code. Check the tool permissions before using it.', 'Pair the community add-on with its matching server.'],
      'Cinema 4D MCP': ['Adjust objects and motion graphics in an existing Cinema 4D project.', 'The production machine needs a working Cinema 4D installation.', "Carry on with the project's existing MoGraph and render settings."],
      'Unreal Engine MCP': ['Call editor tools and inspect the scene in Unreal Editor.', 'What the plugin can do depends on the engine version the project uses.', 'Manage shots in Sequencer and output with Movie Render Queue.'],
      'Remotion': ['Arrange shots, subtitles and audio tracks in React.', 'Complex 3D scenes need extra rendering components.', 'Use parameters to swap the product name, language or aspect ratio.'],
      'React Three Fiber': ['Write Three.js scenes as React components.', 'For video export, the animation has to give the same result each time a given frame is computed.', "Render inside Remotion's ThreeCanvas."],
      'Three.js': ['Control models, materials, cameras and lighting in the browser.', 'Audio recording, the timeline and video encoding have to be arranged separately.', 'Pair it with Remotion or a frame-by-frame export tool.'],
      'HyperFrames': ['Stage interface demos, text and media with web elements.', 'Shots that need models and lights require a separate 3D scene.', 'Put existing web animations and screen recordings on one timeline.'],
      'blender-film': ['A fly-through of a city at night, with scripts for the flight path, lighting and sound.', 'Flight speed and camera positions need adjusting to the scale of the scene.', "Use with Blender, and see the author's finished city night flight."],
      'blender-forest': ['Breaks down a forest set, vegetation scattering and the motion of a car.', 'Tree density and materials affect VRAM use.', 'Check vegetation, bodywork reflections and cast shadows on representative frames.'],
      'blender-car-film': ['Storyboard, snowfall and multi-camera scripts for a short film of a car on a snowy night.', 'The vehicle model and external assets have to be replaced for each project.', 'The shots share one set of assets. Output each separately, then edit.'],
      'EL4CTEO / blender-skills': ['Look up instructions by task: modelling, UV, materials, rigging and baking.', 'Each skill may require a different Blender version.', 'Pick the skill the current shot needs.'],
      'claude-3d-harness': ['Manages production stages, skill versions and intermediate outputs.', 'Check its folder conventions before it takes over an existing project.', 'Follow the scene stages and checkpoints in the repository.'],
      'CloudAI-X / threejs-skills': ['Three.js examples of animation, shaders and performance.', 'The video timeline and the export have to be built separately.', 'Use with Three.js scenes or R3F components.'],
      'cinematic-3d-video': ['Makes short films from a Three.js scene, browser screenshots and FFmpeg.', "First check the template's frame-by-frame output in the target browser.", 'Suits intros and logo animations that can be described with geometric primitives.'],
      'Meshy 3D Agent': ['Generate a model from text or a reference image, then import it into the scene.', "The model's dimensions, topology and outline need checking by hand.", 'After importing into Blender, check it against the product reference images.'],
      'Poly Haven': ['Search CC0 HDRIs, textures and models.', 'Download resolution affects project size and render memory.', 'Light with an HDRI and choose textures for the actual frame size.'],
      'FFmpeg': ['Assemble consecutive frames into a video, encode it and mux the audio track.', 'Sequence numbering and the input frame rate must match the render settings.', 'Reads frame sequences exported from Blender or from a browser.'],
      'Runway MCP': ["Call Runway's image and video tools from Claude.", 'Requires a Runway account. Generation usage is accounted for separately.', 'Generate candidate clips from the storyboard and subject images, then edit.'],
      'Google Flow': ['Generate and arrange video shots from reference material.', "Available models and input types depend on the product's current settings.", 'First compare how the same subject looks in adjacent shots.'],
      'Kling AI': ["Generate shots with Kling's reference images, prompts and keyframe controls.", 'Local geometric dimensions are hard to specify one by one.', 'Keep the reference images and generation settings, and check continuity when editing.']
    },
    // Same order as cases in ../catalog.mjs: [name, description]
    cases: [
      ['City night flight', 'A 10-second first-person flight. Follow the camera path and watch how fast the nearest buildings sweep through the frame.'],
      ['Forest drive', 'A car passes through dense forest. Notice the spacing at which the trees repeat and how the reflections on the bodywork change.'],
      ['Short film of a car on a snowy night', "20 seconds, six camera positions. After each change of position, watch how the headlights, the snow and the car's direction carry over."],
      ['Classroom scene and Blender MCP', 'See how the official connector reads the scene and calls Blender tools.'],
      ['Scene examples for the community add-on', "The author demonstrates modelling instructions and importing external assets. The repository includes the add-on's source code."],
      ['Rooftop room on a rainy night', 'Compare the clay render with the final image and work out which details come from geometry, materials and post-processing.'],
      ['3D phone template', 'Open the Studio preview, scrub frame by frame, then look at the camera and the product model in the template.'],
      ['Web motion and launch videos', 'See how the different templates arrange titles, screen recordings and transitions.'],
      ['Scene editing in Cinema 4D', 'Watch the object selection and scene changes in the official demo.'],
      ['Unreal Editor connection example', "Read the plugin's requirements, how to connect and which tools can be called inside the editor."],
      ['3D prop generation', 'Examples of model generation, texturing, rigging and asset export.'],
      ['Calling Runway from Claude', 'The official connection example explains how to request images or video in a conversation.'],
      ['Flow TV selection', 'Watch the shorts by channel and compare how consistent the subject stays between shots.'],
      ['Reference images and keyframes', 'In the official examples, compare the reference image, the motion description and the output clip.']
    ]
  },
  runtime: {
    common: {
      theme: {light: 'Light', dark: 'Dark', toLight: 'Switch to light mode', toDark: 'Switch to dark mode'}
    },
    home: {
      views: {clay: 'Clay render of the camera from the same position and under the same lights', detail: "Close-up of the camera's lenses and metal lens barrels"},
      subjects: {
        product: "Measure the body's proportions first, and leave a highlight on the lens rims so the outline is easy to check.",
        ui: 'Record the original interface and keep its text on a separate layer from the picture, so the language can be swapped.',
        scene: "Use a clay render to settle the building's proportions and the camera positions, then place detail within what the shots can see.",
        story: 'Draw where the characters enter and leave the frame, and keep one continuity reference image for each adjacent shot.'
      },
      devices: {
        laptop: 'Make a low-resolution preview locally first and note the time one frame takes.',
        mac: 'On the same frame, compare CPU with the Metal render settings available, and note the time and memory.',
        gpu: 'Check VRAM on the frame with the most textures before queuing the whole render.'
      },
      codeAdvice: 'Export a section frame by frame on this machine and check the fonts, canvas size and animation timing.',
      videoAdvice: "Generation time and credits are those recorded by the service. The local machine is mainly used for editing.",
      adviceJoin: ' '
    },
    tools: {
      found: {one: '{n} tool shown', other: '{n} tools shown'},
      picked: ' ({n})',
      chosen: {other: '{n} of three selected.'},
      shortcut: 'Compare selected tools ({n})',
      tableLabel: 'Use, limits and setup of the selected tools',
      tool: 'Tool',
      remove: 'Remove',
      removeAria: 'Remove {name}',
      rows: ['Use', 'Limits', 'Setup']
    },
    cases: {},
    estimate: {
      frames: {one: '{n} frame', other: '{n} frames'},
      minutes: {one: 'about {n} minute', other: 'about {n} minutes'},
      renderJoin: ', ',
      quota: 'About {n}% of that limit window',
      cost: '${n}',
      invalid: '{label}: enter a valid number.',
      range: 'These values are out of range.'
    },
    handbook: {
      briefJoin: ': ',
      copied: 'Prompt copied.',
      selectedAll: "The full text is selected. Use your system's copy command.",
      fileName: 'claude-3d-project-prompt.txt'
    }
  }
};
