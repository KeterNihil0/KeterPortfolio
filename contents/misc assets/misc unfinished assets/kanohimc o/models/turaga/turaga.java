// Made with Blockbench 3.6.3
// Exported for Minecraft version 1.14
// Paste this class into your mod and generate all required imports


public class turaga extends EntityModel {
	private final RendererModel head;
	private final RendererModel body;
	private final RendererModel left_arm_container;
	private final RendererModel left_arm;
	private final RendererModel weapon;
	private final RendererModel right_arm_container;
	private final RendererModel right_arm;
	private final RendererModel left_leg;
	private final RendererModel right_leg;

	public turaga() {
		textureWidth = 64;
		textureHeight = 64;

		head = new RendererModel(this);
		head.setRotationPoint(0.0F, 9.0F, 1.0F);
		head.cubeList.add(new ModelBox(head, 0, 0, -4.0F, -7.0F, -8.0F, 8, 8, 8, 0.0F, false));
		head.cubeList.add(new ModelBox(head, 28, 44, -9.0F, -13.0F, -5.8F, 18, 20, 0, -2.5F, false));

		body = new RendererModel(this);
		body.setRotationPoint(0.0F, 20.0F, 0.0F);
		setRotationAngle(body, -0.1571F, 0.0F, 0.0F);
		body.cubeList.add(new ModelBox(body, 0, 16, -3.0F, -12.0F, -1.0F, 6, 12, 3, 0.0F, false));

		left_arm_container = new RendererModel(this);
		left_arm_container.setRotationPoint(4.0F, 9.5F, 1.5F);
		

		left_arm = new RendererModel(this);
		left_arm.setRotationPoint(0.0F, 0.0F, 0.0F);
		left_arm_container.addChild(left_arm);
		setRotationAngle(left_arm, -0.7854F, 0.0F, -0.2793F);
		left_arm.cubeList.add(new ModelBox(left_arm, 18, 17, -1.0F, -0.5F, -1.0F, 2, 12, 2, 0.0F, false));

		weapon = new RendererModel(this);
		weapon.setRotationPoint(0.0F, 10.5F, 0.0F);
		left_arm.addChild(weapon);
		setRotationAngle(weapon, 2.2253F, 0.0F, 0.4363F);
		weapon.cubeList.add(new ModelBox(weapon, 28, 8, 0.0F, -10.0F, -7.5F, 0, 18, 18, 0.0F, false));

		right_arm_container = new RendererModel(this);
		right_arm_container.setRotationPoint(-4.0F, 9.5F, 1.5F);
		

		right_arm = new RendererModel(this);
		right_arm.setRotationPoint(1.0F, 0.0F, 0.0F);
		right_arm_container.addChild(right_arm);
		setRotationAngle(right_arm, -0.7854F, 0.0F, 0.2793F);
		right_arm.cubeList.add(new ModelBox(right_arm, 18, 17, -2.0F, -0.5F, -1.0F, 2, 12, 2, 0.0F, false));

		left_leg = new RendererModel(this);
		left_leg.setRotationPoint(3.0F, 20.0F, 0.0F);
		setRotationAngle(left_leg, 0.0F, -0.1745F, 0.0F);
		left_leg.cubeList.add(new ModelBox(left_leg, 0, 31, -2.0F, 0.0F, -4.0F, 4, 4, 6, 0.0F, false));

		right_leg = new RendererModel(this);
		right_leg.setRotationPoint(-3.0F, 20.0F, 0.0F);
		setRotationAngle(right_leg, 0.0F, 0.1745F, 0.0F);
		right_leg.cubeList.add(new ModelBox(right_leg, 0, 31, -2.0F, 0.0F, -4.0F, 4, 4, 6, 0.0F, false));
	}

	@Override
	public void render(Entity entity, float f, float f1, float f2, float f3, float f4, float f5) {
		head.render(f5);
		body.render(f5);
		left_arm_container.render(f5);
		right_arm_container.render(f5);
		left_leg.render(f5);
		right_leg.render(f5);
	}

	public void setRotationAngle(RendererModel modelRenderer, float x, float y, float z) {
		modelRenderer.rotateAngleX = x;
		modelRenderer.rotateAngleY = y;
		modelRenderer.rotateAngleZ = z;
	}
}