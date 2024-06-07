import * as THREE from "three";

function calculateAverageUV(mesh) {
  const uvAttribute = mesh.geometry.getAttribute("uv");
  if (!uvAttribute) {
    return null;
  }

  let totalU = 0;
  let totalV = 0;
  const count = uvAttribute.count;

  // Sum all UV coordinates
  for (let i = 0; i < count; i++) {
    totalU += uvAttribute.getX(i);
    totalV += uvAttribute.getY(i);
  }

  // Calculate averages
  const averageU = totalU / count;
  const averageV = totalV / count;

  return { averageU, averageV };
}

function getUVDimensions(mesh) {
  const uvAttribute = mesh.geometry.getAttribute("uv");
  if (!uvAttribute) {
    return null;
  }

  let minU = Infinity;
  let maxU = -Infinity;
  let minV = Infinity;
  let maxV = -Infinity;

  // Iterate over all UV coordinates to find min and max for U and V
  for (let i = 0; i < uvAttribute.count; i++) {
    const u = uvAttribute.getX(i);
    const v = uvAttribute.getY(i);

    if (u < minU) minU = u;
    if (u > maxU) maxU = u;
    if (v < minV) minV = v;
    if (v > maxV) maxV = v;
  }

  // Calculate dimensions
  const width = maxU - minU;
  const height = maxV - minV;

  const smallerSide = Math.min(width, height);

  return smallerSide;
}

function calculateUVArea(geometry) {
  const uvAttribute = geometry.attributes.uv;
  const indexAttribute = geometry.index;

  let totalArea = 0;

  // Function to calculate the area of a triangle given its vertices
  function triangleArea(uv1, uv2, uv3) {
    return Math.abs(
      (uv1.x * (uv2.y - uv3.y) +
        uv2.x * (uv3.y - uv1.y) +
        uv3.x * (uv1.y - uv2.y)) /
        2.0
    );
  }

  for (let i = 0; i < indexAttribute.count; i += 3) {
    const index1 = indexAttribute.getX(i);
    const index2 = indexAttribute.getX(i + 1);
    const index3 = indexAttribute.getX(i + 2);

    const uv1 = new THREE.Vector2(
      uvAttribute.getX(index1),
      uvAttribute.getY(index1)
    );
    const uv2 = new THREE.Vector2(
      uvAttribute.getX(index2),
      uvAttribute.getY(index2)
    );
    const uv3 = new THREE.Vector2(
      uvAttribute.getX(index3),
      uvAttribute.getY(index3)
    );

    const area = triangleArea(uv1, uv2, uv3);
    totalArea += area;
  }

  return totalArea / 2;
}

export { getUVDimensions, calculateAverageUV, calculateUVArea };
