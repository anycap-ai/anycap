import assert from "node:assert/strict";
import test from "node:test";
import contract from "../public/visuals/agent-core-3d/model-contract.json" with { type: "json" };
import legacy from "../public/visuals/agent-core/asset-manifest.json" with { type: "json" };

test("locks the approved custom-rig contract", () => {
  assert.deepEqual(contract.artboard, { width: 1672, height: 941 });
  assert.deepEqual(contract.anchors.socketScreen, legacy.anchors.socketCenter);
  assert.deepEqual(contract.anchors.dockScreen, legacy.anchors.dockCenter);
  assert.deepEqual(contract.gazeLimitsDegrees.yaw, [-70, 70]);
  assert.deepEqual(contract.gazeLimitsDegrees.pitch, [-25, 25]);
  assert.deepEqual(contract.gazeLimitsDegrees.roll, [-3, 3]);
  assert.deepEqual(contract.task7WaypointAdapter, {
    scale: [-0.2826086956521739, 0.33088235294117646, -0.0736842105263158],
    offset: [0.035, 0.38323529411764706, 0.198],
    r3fRootTranslation: [-0.1, 0, 0],
    auditedEndpoints: {
      dock: {
        gltfLocal: [-0.225, 0.145, 0.17],
        stageWorld: [-0.325, 0.145, 0.17],
      },
      socket: {
        gltfLocal: [0.035, 0.37, 0.142],
        stageWorld: [-0.065, 0.37, 0.142],
      },
      rest: {
        gltfLocal: [-0.128913, 0.217794, 0.175895],
        stageWorld: [-0.228913, 0.217794, 0.175895],
      },
    },
  });
  assert.deepEqual(contract.asset, {
    file: "agent-core-upper-body.glb",
    maxBytes: 3145728,
    maxTextureDimension: 2048,
    maxDrawCalls: 45,
    maxTriangles: 100000,
    maxVertices: 75000,
    maxBones: 32,
    maxSkinInfluences: 4,
  });
  assert.deepEqual(contract.requiredHierarchy, {
    torso: "AgentRoot",
    chest_socket: "torso",
    clavicle_R: "AgentRoot",
    upper_arm_R: "clavicle_R",
    forearm_R: "upper_arm_R",
    hand_R: "forearm_R",
    ik_target_R: "AgentRoot",
    neck_lower: "AgentRoot",
    neck_upper: "neck_lower",
    head: "neck_upper",
    visor: "head",
    core_grip_R: "hand_R",
    core: "AgentRoot",
    core_dock: "AgentRoot",
  });
  assert.equal(
    new Set([...contract.requiredNodes, ...contract.requiredBones]).size,
    contract.requiredNodes.length + contract.requiredBones.length,
  );
  assert.deepEqual(contract.forbidden, ["tripo", "meshy", "spline", "http://", "https://"]);
  const { forbidden, ...contractWithoutForbidden } = contract;
  assert.doesNotMatch(JSON.stringify(contractWithoutForbidden).toLowerCase(), /tripo|meshy|spline|https?:\/\//);
});
