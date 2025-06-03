# dut-modeling

A 3D modeling and visualization project using three.js for rendering interactive 3D scenes with React frontend and Node.js backend.

## Project Overview

This project demonstrates 3D modeling capabilities with panoramic skybox environments, interactive 3D scenes, and modern web technologies. It includes examples of 360-degree panoramas, 3D object loading, and real-time rendering.

## Project Structure

```
├── README.md
├── package.json
├── .gitignore
├── start-app.bat           # Quick start script for Windows
├── backend/                # Node.js server and API
│   ├── .env               # Environment variables
│   ├── index.js           # Main server file
│   ├── package.json       # Backend dependencies
│   └── media/             # Media assets and uploads
├── frontend/              # React frontend application
│   └── my-app/            # Vite + React app
├── images/                # Image assets
│   ├── export/            # Exported images
│   └── raws/              # Raw image files
├── previews/              # HTML/JS/CSS demo files
│   ├── 07-11-skybox-panorama.html
│   ├── 07-11-skybox-panorama.js
│   ├── base-example.js
│   ├── style.css
│   └── vitacura-360-drone.jpg
├── three.js/              # Local three.js library
│   ├── build/             # Built three.js files
│   ├── docs/              # Documentation
│   ├── editor/            # Three.js editor
│   ├── examples/          # Example projects
│   ├── src/               # Source code
│   └── ...
└── tools/                 # Development tools and scripts
    └── test.ipynb         # Jupyter notebook for testing
```

## Features

-  **3D Scene Rendering**: Interactive 3D scenes using three.js
-  **Panoramic Environments**: 360-degree skybox panoramas
-  **Model Loading**: Support for various 3D model formats (PLY, OBJ, PDB, etc.)
-  **Real-time Interaction**: Mouse and keyboard controls for scene navigation
-  **Responsive Design**: Works across different screen sizes
-  **Development Tools**: Integrated editor and debugging tools

## Getting Started

### Prerequisites

-  **Node.js** (v16+ recommended)
-  **npm** or **yarn**
-  Modern web browser with WebGL support

### Quick Start (Windows)

Run the batch file to start both frontend and backend:

```bash
start-app.bat
```

### Manual Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd dut-modeling
   ```

2. **Install root dependencies:**

   ```bash
   npm install
   ```

3. **Setup backend:**

   ```bash
   cd backend
   npm install
   ```

4. **Setup frontend:**
   ```bash
   cd frontend/my-app
   npm install
   ```

### Running the Application

#### Development Mode

**Backend Server:**

```bash
cd backend
npm start
```

The backend will run on `http://localhost:3001` (or port specified in .env)

**Frontend Development Server:**

```bash
cd frontend/my-app
npm run dev
```

The frontend will run on `http://localhost:5173`
#### Production Mode

You can use the `start-app.bat` script for a quick production start on Windows, or run the following steps manually:

**Build frontend:**

```bash
cd frontend/my-app
npm run build
```

**Start production server:**

```bash
cd backend
npm run start:prod
```

Alternatively, run:

```bash
start-app.bat
```

This will build the frontend and start both frontend and backend servers automatically.

### Preview Examples

Open the HTML files in the `previews/` directory directly in your browser to see standalone demos:

-  [`07-11-skybox-panorama.html`](previews/07-11-skybox-panorama.html) - 360° panoramic environment
-  Other examples in the [`previews/`](previews/) folder

## Usage

### Basic 3D Scene

The project includes several example implementations:

```javascript
// Basic three.js setup
import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
const renderer = new THREE.WebGLRenderer();

// Add your 3D objects, lights, and controls
```

### Loading 3D Models

The project supports various model formats through the three.js ecosystem:

-  **PLY files**: Using [`PLYLoader`](three.js/examples/jsm/loaders/PLYLoader.js)
-  **PDB files**: Using [`PDBLoader`](three.js/examples/jsm/loaders/PDBLoader.js) for molecular data
-  **OBJ files**: Standard 3D object format
-  **And many more formats** available in [`three.js/examples/jsm/loaders/`](three.js/examples/jsm/loaders/)

### Environment Configuration

Create a `.env` file in the backend directory:

```env
PORT=3001
NODE_ENV=development
MEDIA_PATH=./media
```

## Three.js Integration

This project uses a local copy of [three.js](three.js/README.md) which includes:

-  **Core Library**: Complete three.js source code in [`three.js/src/`](three.js/src/)
-  **Examples**: Extensive examples in [`three.js/examples/`](three.js/examples/)
-  **Documentation**: Full documentation in [`three.js/docs/`](three.js/docs/)
-  **Editor**: Built-in 3D editor in [`three.js/editor/`](three.js/editor/)

## Development Tools

### Jupyter Notebook

Use the Jupyter notebook for testing and experimentation:

```bash
cd tools
jupyter notebook test.ipynb
```

### Three.js Editor

Access the three.js editor at [`three.js/editor/index.html`](three.js/editor/index.html) for visual scene creation.

## API Endpoints

The backend provides the following endpoints:

-  `GET /api/models` - List available 3D models
-  `POST /api/upload` - Upload new model files
-  `GET /api/media/:filename` - Serve media files
-  `GET /api/scenes` - List saved scenes

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project uses multiple licenses depending on the component:

-  **Project Code**: MIT License (see LICENSE file)
-  **Three.js**: MIT License (see [`three.js/LICENSE`](three.js/LICENSE))
-  **Example Models**: Various licenses (see individual model directories)
-  **Textures and Assets**: Various Creative Commons licenses (see asset directories)

## Acknowledgments

-  [**Three.js**](three.js/README.md) - 3D graphics library
-  **React** - Frontend framework
-  **Vite** - Build tool and development server
-  **Node.js** - Backend runtime
-  Various model and texture contributors (see individual asset licenses)

## Troubleshooting

### Common Issues

1. **Port conflicts**: Modify ports in package.json or .env files
2. **CORS errors**: Ensure backend is running and accessible
3. **WebGL not supported**: Use a modern browser with WebGL enabled
4. **Model loading failures**: Check file paths and formats

### Browser Support

-  Chrome 90+
-  Firefox 88+
-  Safari 14+
-  Edge 90+

For best performance, use browsers with full WebGL 2.0 support.

## Performance Tips

-  Use compressed model formats when possible
-  Implement LOD (Level of Detail) for complex scenes
-  Enable texture compression for large textures
-  Use instancing for repeated objects
-  Monitor memory usage with browser dev tools

---

For more information, visit the [three.js documentation](three.js/docs/) or check the [examples directory](three.js/examples/).
