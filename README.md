# ArNavigationCollege


An immersive augmented reality indoor navigation system built with React, Three.js, and WebXR. Navigate through indoor spaces with animated 3D path indicators and real-time AR visualization.

![AR Navigation Demo](https://github.com/deeperzz8356/ArNavigationCollege/blob/main/image.png)

## ✨ Features

- **Augmented Reality Navigation**: WebXR-powered AR experience for real-world navigation
- **Interactive 3D Floor Plans**: Fully rendered indoor environments with walls, floors, and room labels
- **Animated Path Guidance**: Glowing, floating arrows that guide users along optimal routes
- **Dual View Modes**: Switch between default and far views for different perspectives
- **Pathfinding Algorithm**: Intelligent routing between waypoints using graph traversal
- **Real-time Updates**: Dynamic path recalculation based on start and end points
- **Responsive Design**: Adapts to different screen sizes and orientations

## 🚀 Demo

The application features:
- Purple-themed glowing path indicators with pulse animations
- Smooth camera controls with OrbitControls
- Shadow-mapped lighting for realistic depth
- AR mode with invisible walls for seamless real-world integration
- Floating animation effects on navigation arrows

## 🛠️ Tech Stack

- **Frontend Framework**: React 18+ with TypeScript
- **3D Graphics**: Three.js (r128)
- **AR Support**: WebXR API
- **Styling**: Tailwind CSS
- **Build Tool**: Vite/Create React App

## 📋 Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager
- WebXR-compatible device (for AR features)
- HTTPS connection (required for WebXR)

## 🔧 Installation

1. Clone the repository:
```bash
git https://github.com/deeperzz8356/ArNavigationCollege.git
cd ar-navigation
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `https://localhost:3000`

**Note**: WebXR requires HTTPS. You may need to set up SSL certificates for local development.

## 📱 Usage

### Desktop Mode
1. Select a start room from the dropdown
2. Select a destination room
3. View the animated path on the 3D floor plan
4. Use mouse controls to orbit, zoom, and pan the view
5. Toggle between default and far view using the button

### AR Mode
1. Click the "Start AR" button
2. Grant camera permissions when prompted
3. Point your device at a flat surface
4. The floor plan will anchor to the real world
5. Follow the glowing arrows to your destination

## 🏗️ Project Structure

```
ar-navigation/
├── src/
│   ├── components/
│   │   ├── ARScene.tsx          # Main AR scene component
│   │   ├── Walls.tsx             # Wall rendering logic
│   │   └── ...
│   ├── data/
│   │   └── floorPlanData.ts      # Floor plan configuration
│   ├── utils/
│   │   └── pathfinding.ts        # A* pathfinding algorithm
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
└── README.md
```

## 🎨 Customization

### Changing Colors
The project uses a purple theme. To customize colors, modify the hex values in `ARScene.tsx`:

```typescript
// Arrow colors
color: 0xC792EA  // Light purple
emissive: 0xC792EA

// Accent lights
new THREE.PointLight(0xC792EA, 0.5)
```

### Adding Rooms
Edit `floorPlanData.ts` to add new rooms and waypoints:

```typescript
{
  id: "room_new",
  name: "New Room",
  center: [x, z],
  connectedTo: ["waypoint_id"]
}
```

### Adjusting Path Animation
Modify animation parameters in the `animate()` function:

```typescript
// Arrow spacing
if (animationIndexRef.current % 4 === 0)

// Float animation speed/amplitude
const floatOffset = Math.sin(time * 2 + i) * 0.02

// Glow pulse intensity
const pulse = 1.5 + Math.sin(time * 3 + i) * 0.8
```

## 🔌 API Reference

### ARScene Component Props

| Prop | Type | Description |
|------|------|-------------|
| `startRoom` | `string` | ID of the starting room |
| `endRoom` | `string` | ID of the destination room |
| `onSessionStateChange` | `(active: boolean) => void` | Callback for AR session state |
| `showARButton` | `boolean` | Show/hide AR activation button |
| `showUIView` | `boolean` | Show/hide view toggle button |

## 🌐 Browser Compatibility

- Chrome 90+ (Android)
- Edge 90+
- Safari 15.4+ (iOS/iPadOS with WebXR support)

**Note**: WebXR availability varies by device and browser. Check [caniuse.com/webxr](https://caniuse.com/webxr) for current support.

## 🐛 Known Issues

- AR mode requires HTTPS in production
- Some iOS devices have limited WebXR support
- Performance may vary on lower-end devices

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- Three.js community for excellent documentation
- WebXR Device API specification contributors
- React team for the amazing framework

## 📧 Contact

Your Name - [@Deepkumar pandey](https://www.linkedin.com/in/deepkumar-pandey/)

Project Link: [https://github.com/deeperzz8356/ar-navigation](https://deeperzz8356.github.io/ArNavigationCollege/)

---

Made with ❤️ and React
