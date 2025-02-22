// Made with Blockbench 3.6.3
// Exported for Minecraft version 1.14
// Paste this class into your mod and generate all required imports


public class ussal extends EntityModel {
	private final RendererModel core;
	private final RendererModel body;
	private final RendererModel left_arm;
	private final RendererModel left_arm2;
	private final RendererModel right_arm;
	private final RendererModel right_arm1;
	private final RendererModel left_leg_container_1;
	private final RendererModel left_leg_1;
	private final RendererModel left_leg_container_2;
	private final RendererModel left_leg_2;
	private final RendererModel left_leg_container_3;
	private final RendererModel left_leg_3;
	private final RendererModel right_leg_container_1;
	private final RendererModel right_leg_1;
	private final RendererModel right_leg_container_2;
	private final RendererModel right_leg_2;
	private final RendererModel right_leg_container_3;
	private final RendererModel right_leg_3;
	private final RendererModel left_eye;
	private final RendererModel right_eye;

	public ussal() {
		textureWidth = 64;
		textureHeight = 64;

		core = new RendererModel(this);
		core.setRotationPoint(0.0F, 24.0F, 0.0F);
		setRotationAngle(core, 0.0F, -1.5708F, 0.0F);
		

		body = new RendererModel(this);
		body.setRotationPoint(0.0F, 0.0F, 0.0F);
		core.addChild(body);
		body.cubeList.add(new ModelBox(body, 0, 0, -5.0F, -4.0F, -5.0F, 10, 3, 10, 0.0F, false));
		body.cubeList.add(new ModelBox(body, 20, 14, -4.0F, -8.0F, 2.0F, 8, 5, 5, 0.0F, false));

		left_arm = new RendererModel(this);
		left_arm.setRotationPoint(4.0F, -8.0F, 5.0F);
		body.addChild(left_arm);
		setRotationAngle(left_arm, 1.8326F, -0.6109F, 0.0873F);
		left_arm.cubeList.add(new ModelBox(left_arm, 11, 15, -2.0F, -10.0F, 0.0F, 3, 11, 1, 0.0F, false));

		left_arm2 = new RendererModel(this);
		left_arm2.setRotationPoint(0.5F, -9.5F, 0.0F);
		left_arm.addChild(left_arm2);
		setRotationAngle(left_arm2, 0.0F, 0.0F, 1.8326F);
		left_arm2.cubeList.add(new ModelBox(left_arm2, 0, 14, -3.0F, -1.0F, -0.5F, 3, 12, 2, 0.0F, false));

		right_arm = new RendererModel(this);
		right_arm.setRotationPoint(-4.0F, -8.0F, 5.0F);
		body.addChild(right_arm);
		setRotationAngle(right_arm, 1.8326F, 0.6109F, -0.0873F);
		right_arm.cubeList.add(new ModelBox(right_arm, 11, 15, -1.0F, -10.0F, 0.0F, 3, 11, 1, 0.0F, false));

		right_arm1 = new RendererModel(this);
		right_arm1.setRotationPoint(-0.5F, -9.5F, 0.0F);
		right_arm.addChild(right_arm1);
		setRotationAngle(right_arm1, 0.0F, 0.0F, -1.9199F);
		right_arm1.cubeList.add(new ModelBox(right_arm1, 0, 14, -1.0F, -1.0F, -0.5F, 3, 12, 2, 0.0F, false));

		left_leg_container_1 = new RendererModel(this);
		left_leg_container_1.setRotationPoint(5.0F, -2.5F, 0.0F);
		core.addChild(left_leg_container_1);
		

		left_leg_1 = new RendererModel(this);
		left_leg_1.setRotationPoint(0.0F, 0.0F, 0.0F);
		left_leg_container_1.addChild(left_leg_1);
		setRotationAngle(left_leg_1, 0.0F, 0.0F, -1.1345F);
		left_leg_1.cubeList.add(new ModelBox(left_leg_1, 0, 0, -1.0F, -0.5F, -1.0F, 2, 7, 2, 0.0F, false));

		left_leg_container_2 = new RendererModel(this);
		left_leg_container_2.setRotationPoint(5.0F, -2.5F, -2.0F);
		core.addChild(left_leg_container_2);
		

		left_leg_2 = new RendererModel(this);
		left_leg_2.setRotationPoint(0.0F, 0.0F, 0.0F);
		left_leg_container_2.addChild(left_leg_2);
		setRotationAngle(left_leg_2, -0.3491F, 0.0F, -1.1345F);
		left_leg_2.cubeList.add(new ModelBox(left_leg_2, 0, 0, -1.0F, -0.5F, -1.0F, 2, 7, 2, 0.0F, false));

		left_leg_container_3 = new RendererModel(this);
		left_leg_container_3.setRotationPoint(5.0F, -2.5F, 2.0F);
		core.addChild(left_leg_container_3);
		

		left_leg_3 = new RendererModel(this);
		left_leg_3.setRotationPoint(0.0F, 0.0F, 0.0F);
		left_leg_container_3.addChild(left_leg_3);
		setRotationAngle(left_leg_3, 0.3491F, 0.0F, -1.1345F);
		left_leg_3.cubeList.add(new ModelBox(left_leg_3, 0, 0, -1.0F, -0.5F, -1.0F, 2, 7, 2, 0.0F, false));

		right_leg_container_1 = new RendererModel(this);
		right_leg_container_1.setRotationPoint(-5.0F, -2.5F, 0.0F);
		core.addChild(right_leg_container_1);
		

		right_leg_1 = new RendererModel(this);
		right_leg_1.setRotationPoint(0.0F, 0.0F, 0.0F);
		right_leg_container_1.addChild(right_leg_1);
		setRotationAngle(right_leg_1, 0.0F, 0.0F, -2.0071F);
		right_leg_1.cubeList.add(new ModelBox(right_leg_1, 0, 0, -1.0F, -6.5F, -1.0F, 2, 7, 2, 0.0F, false));

		right_leg_container_2 = new RendererModel(this);
		right_leg_container_2.setRotationPoint(-5.0F, -2.5F, -2.0F);
		core.addChild(right_leg_container_2);
		

		right_leg_2 = new RendererModel(this);
		right_leg_2.setRotationPoint(0.0F, 0.0F, 0.0F);
		right_leg_container_2.addChild(right_leg_2);
		setRotationAngle(right_leg_2, 0.3491F, 0.0F, -2.0071F);
		right_leg_2.cubeList.add(new ModelBox(right_leg_2, 0, 0, -1.0F, -6.5F, -1.0F, 2, 7, 2, 0.0F, false));

		right_leg_container_3 = new RendererModel(this);
		right_leg_container_3.setRotationPoint(-5.0F, -2.5F, 2.0F);
		core.addChild(right_leg_container_3);
		

		right_leg_3 = new RendererModel(this);
		right_leg_3.setRotationPoint(0.0F, 0.0F, 0.0F);
		right_leg_container_3.addChild(right_leg_3);
		setRotationAngle(right_leg_3, -0.3491F, 0.0F, -2.0071F);
		right_leg_3.cubeList.add(new ModelBox(right_leg_3, 0, 0, -1.0F, -6.5F, -1.0F, 2, 7, 2, 0.0F, false));

		left_eye = new RendererModel(this);
		left_eye.setRotationPoint(2.0F, -4.0F, -3.0F);
		core.addChild(left_eye);
		setRotationAngle(left_eye, 0.2618F, 0.0F, 0.1745F);
		left_eye.cubeList.add(new ModelBox(left_eye, 31, 0, 0.0F, -6.0F, -2.0F, 1, 6, 1, 0.0F, false));
		left_eye.cubeList.add(new ModelBox(left_eye, 40, 0, -0.5F, -8.0F, -2.5F, 2, 2, 2, 0.0F, false));

		right_eye = new RendererModel(this);
		right_eye.setRotationPoint(-2.0F, -4.0F, -3.0F);
		core.addChild(right_eye);
		setRotationAngle(right_eye, 0.2618F, 0.0F, -0.1745F);
		right_eye.cubeList.add(new ModelBox(right_eye, 31, 0, -1.0F, -6.0F, -2.0F, 1, 6, 1, 0.0F, false));
		right_eye.cubeList.add(new ModelBox(right_eye, 40, 0, -1.5F, -8.0F, -2.5F, 2, 2, 2, 0.0F, false));
	}

	@Override
	public void render(Entity entity, float f, float f1, float f2, float f3, float f4, float f5) {
		core.render(f5);
	}

	public void setRotationAngle(RendererModel modelRenderer, float x, float y, float z) {
		modelRenderer.rotateAngleX = x;
		modelRenderer.rotateAngleY = y;
		modelRenderer.rotateAngleZ = z;
	}
}