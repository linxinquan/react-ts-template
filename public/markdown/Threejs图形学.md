# Threejs/图形学

## BufferGeometry和Geometry的主要区别如下：

1.  数据存储方式

BufferGeometry：

使用Typed Arrays（如Float32Array）来存储顶点、法线、UV等数据。

数据存储在GPU的缓冲区中，优化了内存使用和渲染效率。

Geometry：

使用普通的JavaScript数组来存储顶点和其他属性。

数据存储在CPU内存中，可能导致性能瓶颈。

1.  性能

BufferGeometry：

更快的渲染性能，尤其是在处理大量顶点和对象时。

支持批处理，减少绘制调用（draw calls）。

Geometry：

性能较低，不适合处理复杂场景或大量对象。

1.  API复杂性

BufferGeometry：

API更复杂，需要更多的代码来设置和管理几何体。

提供更大的灵活性，支持多种顶点属性。

Geometry：

API相对简单，适合快速开发和原型设计。

提供一些自动处理的功能，如法线生成和平滑组。

1.  功能支持

BufferGeometry：

更适合现代WebGL应用，支持更多高级特性。

对于动态更新和修改几何体数据更高效。

Geometry：

一些高级功能（如平滑组和自动法线计算）实现较为简单。

1.  使用场景

BufferGeometry：

适合需要高性能的应用，如游戏、复杂场景和大量对象的渲染。

Geometry：

适合简单场景或快速原型开发。

优点（BufferGeometry）：

性能：

更快的渲染：BufferGeometry将数据存储在GPU的缓冲区中，减少了CPU和GPU之间的数据传输，提高了渲染速度。

批处理：可以更有效地处理大量对象，减少绘制调用（draw calls）。

内存效率：

使用Typed Arrays（如Float32Array）存储数据，内存占用更少。

灵活性：

支持更多的顶点属性，可以更轻松地处理复杂的几何体（如不同的UV坐标、法线等）。

动态更新：

可以在运行时高效地更新几何体数据，适合动态场景。

缺点（BufferGeometry）：

使用复杂性：

相比于Geometry，BufferGeometry的API更复杂，使用起来需要更多的代码和理解。

功能限制：

某些高级功能（如自动生成法线、平滑组等）在BufferGeometry中可能不如Geometry直观。

调试困难：

由于数据直接存储在缓冲区，调试和可视化几何体时可能不如Geometry方便。

## 图形学原理

1.  图形表示：图形的表示方法，包括点、线、面、体等基本图形元素，以及它们的数学表示。
2.  图形变换：图形的变换，包括平移、旋转、缩放、倾斜等基本变换，以及它们的数学表示。
3.  投影：图形的投影，包括正交投影、透视投影、axonometric投影等。
4.  光栅化：图形的光栅化，包括点、线、面等图形元素的光栅化算法。
5.  着色：图形的着色，包括颜色模型、着色算法、纹理映射等。
6.  光照：图形的光照，包括光源模型、光照算法、阴影计算等。
7.  动画：图形的动画，包括动画基本原理、关键帧动画、物理引擎等。
8.  几何计算：图形的几何计算，包括点、线、面等图形元素的几何计算，包括距离、角度、投影等。
9.  图形算法：图形的算法，包括图形的遍历、图形的裁剪、图形的合并等。
10. 图形数据结构：图形的数据结构，包括图形的存储、图形的检索等。

## 坐标转换

屏幕转世界坐标

屏幕坐标是左上角为原点，世界坐标是中心为原点。

归一化，移动到原点。(x/w)*2-1 (y/h)*2+1 得到一个ndc

ndc转世界坐标，应用一个投影逆矩阵。

```JavaScript
const stdVector = new Vector3(x1, y1, 0.5);
const worldVector = stdVector.unproject(camera);
```

如果是在threejs里，有个核心类Raycaster，处理鼠标拾取的，

## three创建一个场景

```JavaScript
const scene = new Scene();
const camera = new PerspctiveCamera();
const renderer = new WebGLRenderer();
document.body.appendChild(renderer.domElement);

scene.add(obj);
renderer.render(scene, camera)
```

## 渲染器

WebGLRenderer

CSS2DRenderer

CSS3DRenderer

## 顶点着色器和片元着色器

- 顶点着色器用于处理每个顶点的属性（如位置、颜色等），并将其转换为裁剪空间中的坐标。
- 片元着色器负责处理光栅化后的每个片元（像素），决定最终的颜色和其他属性。

## webGL和webGPU有什么区别

WebGPU提供更接近底层硬件的控制，高性能，支持更复杂的图像和计算。

图形渲染管线

固定的渲染管线，webGL只能操作其中的顶点着色器和片元着色器

webGPU可以使用更灵活的渲染管线

例如光栅化这一步，webGL提供了几个api，指定图元类型，设置状态剔除、深度测试、混合

webGPU配置多个参数，topology，状态，深度测试，多重采样，还支持自定义行为

抽象层度

webGL抽象层次较高，性能受到限制

webGPU直接的管理GPU资源和状态，性能更好

## 性能优化

**1.空间索引**

Frustum 先筛出可视范围内的对象

R-tree

**2.对象合并/复用**

mergeGeometries

instance

**3.Webworker 离屏渲染**

const offscreen = canvas.transferControlToOffscreen();

场景是方案列表中的预览小图，把渲染的过程放到webworker中处理，渲染完成后，

postMessage把canvas.convertToBlob()发送到主线程上，主线程只需把二进制转成img

navigator.hardwareConcurrency

限制并行worker数量：当数量大于限制，把待执行的参数放进队列。执行结束时，判断队列有无元素，有就推出一个创建一个worker。

4**.对象查找**

**this.scene.getObjectByName** 默认是dfs。我们的场景中对象层级 group-group-obj。通常会查找某个种类的group。添加了bfs

```JavaScript
    const stack = this.scene.children.slice();
    while (stack.length > 0) {
      const obj = stack.shift();
      if (obj && obj.name === name) {
        return obj;
      }
      if (obj && obj.children.length) {
        stack.push(...obj.children);
      }
    }
    return undefined;
```

## 如何在三维场景中添加文字

1.CanvasTexture+SpriteMaterial+Sprite

2.TextGeometry+Mesh

中文字体需要加载字体包

const font = new FontLoader().parse(fontJSON);

3.html标签

import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';

new CSS2DObject(this.container);

new CSS3DObject(span);

还需要引入额外的renderer

## 清除对象

从场景树中移除，同时尝试彻底销毁 Object3D 对象，释放内存

优化性能：requestIdleCallback

```JavaScript
object?.dispatchEvent({ type: 'removed' });
object.geometry.dispose();
delete object.geometry;

object.material.dispose();
delete object.material;
```

## 欧拉角和四元数

表示三个轴的旋转量

Euler( x : Float, y : Float, z : Float, order : String )

欧拉角

Quaternion( x : Float, y : Float, z : Float, w : Float )

在插值时更加平滑，计算效率更高，适合动画

this.currentQuaternion.rotateTowards(this.targetQuaternion, step);

## R-tree

处理高位空间存储问题的数据结构，和二叉查找树是类似的作用。特点处理高维空间，子节点是平衡的。

构建这棵树需要计算对象的最小边界框，R树会将距离相近的节点收集起来，放到同一个父节点下，这个父节点不保存图形信息，而是记录子节点合并的包围盒数据。如果父节点多了，再会重复这个步骤，将距离近的节点放进同一个节点。

检索过程，输入一个选区矩形，从根节点开始，往下递归查找输入是否与当前节点矩形相交。

平衡的树，会预设节点中条目数量最大最小值，插入和删除会做额外的判断。插入时，节点中条目数量超过限制，该节点会分裂为两个节点。删除时，小于最小，可能会合并兄弟基点。实际可能在如何选择最佳插入节点之类的会有更多的优化策略，提高性能。

Kd-tree对空间划分，是一个二叉树结构，每次分割会站在xy轴交替进行。可能存在一个物体在多个节点上

b树，也是一个自平衡树，多用于管理可排序的数据。

## Webgl渲染管线

输入几何顶点

经过顶点着色器的转换，如果是glsl编程，在这一步会将世界坐标转换成裁剪坐标，

图元装配，根据图元类型，决定将顶点渲染为不同的图元类型，比如三角形、线段、点

光栅化，连续的图形转换为屏幕上离散的像素点，在这个过程涉及确定哪些像素被三角形覆盖。

着色，使用片段着色器，并计算像素最终的颜色。

输出合并，将片段着色器和帧缓冲区内容合并，像素缓冲区（frame）是存储渲染结果的内存区域，通常包括颜色缓冲区，深度缓冲区。合并的过程有这几个操作：深度测试，比较新片段的深度值和当前以存储的深度值，更小则更新。如果启用了混合（透明），将新片段颜色和已存储颜色进行混合得到最终颜色。最后更新颜色缓冲区。

## 顶点周涩情坐标转换

在 `gl_Position` 的计算中，通常会经历以下几个步骤：

1.  **模型变换（Model Matrix）**：
    1. 将局部坐标系中的顶点位置转换为世界坐标系。这个变换通常包括平移、旋转和缩放等操作。
2.  **视图变换（View Matrix）**：
    1. 将世界坐标系中的顶点位置转换为相机坐标系。这是通过将场景中的对象相对于相机的位置进行变换来实现的。
3.  **投影变换（Projection Matrix）**：
    1. 将相机坐标系中的顶点位置转换为裁剪坐标系。这一过程通常涉及透视或正交投影，使得最终的坐标可以在屏幕上进行渲染。

## glsl编程

顶点着色器 vertexShader 片元着色器 framentShader

## 大体量模型渲染优化策略

1.分成多个模型文件，分段加载

2.合并几何，减少draw call

看看xq的优化分享

## web3D模型格式

Web三维模型格式主要包括以下几种：

1.  **GLTF/GLB**：这是现代网页上使用最广泛的三维模型格式，GLB是GLTF的二进制版本，支持纹理、动画等。
2.  **OBJ**：一种简单的三维模型格式，易于解析，但不支持复杂的材质和动画。
3.  **FBX**：广泛用于游戏和动画制作，支持复杂的动画和材质，但文件较大，解析较慢。
4.  **STL**：主要用于3D打印，支持简单的几何形状，但不支持颜色和纹理。
5.  **Collada (DAE)**：一种开放的三维文件格式，支持动画和材质，但使用较少。
6.  **3DS**：老旧的3D Studio格式，支持多种几何体，但逐渐被其他格式取代。
7.  **PLY**：主要用于点云数据，支持颜色和透明度信息。

这些格式各有优缺点，选择时要根据具体需求和应用场景来决定。

`gltf` 是现阶段主流的模型类型，可以包含模型、动画、几何图形、材质、灯光、相机，甚至整个场景。glb 是它的二进制形式，体积小很多，不过会把纹理贴图也转成二进制格式，所以实际项目中尽量使用这种，不过 gltf 可读性更好

`obj` 是一种简单的文本格式，可以包含顶点位置、纹理坐标、法线等信息。缺点是文件体积相对较大，不支持二进制数据存储，无法存储动画数据，不支持材质和纹理的自定义属性等

`mtl` 是一种与 obj 配套使用的材质文件格式。mtl 文件包含了 obj 模型所需的材质属性信息，如颜色、纹理、法线贴图等。在加载 obj 模型时，可以通过 OBJLoader 来解析 obj 文件，并通过 MTLLoader 来加载对应的 mtl 文件。MTLLoader 会解析 mtl 文件中的信息，并将材质属性应用于对应的物体

`fbx`是一种3D通用模型文件。包含动画、材质特性、贴图、骨骼动画、灯光、摄像机等信息
