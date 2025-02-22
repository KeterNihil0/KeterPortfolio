// Made with Blockbench 3.5.4
// Exported for Minecraft version 1.14
// Paste this class into your mod and generate all required imports


public class plant_ent extends EntityModel {
	private final RendererModel body;
	private final RendererModel bodyUpper;
	private final RendererModel head;
	private final RendererModel armRight;
	private final RendererModel armRight2;
	private final RendererModel legRight;
	private final RendererModel legLeft;

	public plant_ent() {
		textureWidth = 256;
		textureHeight = 256;

		body = new RendererModel(this);
		body.setRotationPoint(0.0F, -4.0F, 0.0F);
		setRotationAngle(body, 0.0873F, 0.0F, 0.0F);
		body.cubeList.add(new ModelBox(body, 63, 45, -6.0F, -13.0F, -2.0F, 11, 9, 4, 4.0F, false));

		bodyUpper = new RendererModel(this);
		bodyUpper.setRotationPoint(0.0F, -16.0F, -3.0F);
		body.addChild(bodyUpper);
		setRotationAngle(bodyUpper, 0.0873F, 0.0F, 0.0F);
		bodyUpper.cubeList.add(new ModelBox(bodyUpper, 0, 45, -13.0F, -18.0F, -6.0F, 24, 17, 15, 4.0F, false));
		bodyUpper.cubeList.add(new ModelBox(bodyUpper, 0, 0, -14.0F, -32.0F, -7.0F, 26, 28, 17, 4.0F, false));

		head = new RendererModel(this);
		head.setRotationPoint(4.0F, -22.0F, -7.0F);
		bodyUpper.addChild(head);
		head.cubeList.add(new ModelBox(head, 0, 0, -6.0F, -9.0F, -4.0F, 3, 5, 4, 6.0F, false));
		head.cubeList.add(new ModelBox(head, 38, 77, -7.0F, -12.0F, -5.0F, 5, 7, 4, 6.0F, false));

		armRight = new RendererModel(this);
		armRight.setRotationPoint(-20.0F, -16.0F, 1.0F);
		bodyUpper.addChild(armRight);
		setRotationAngle(armRight, -0.1745F, 0.0F, 0.0873F);
		armRight.cubeList.add(new ModelBox(armRight, 0, 77, -10.0F, -1.0F, -6.0F, 13, 40, 12, 0.0F, false));

		armRight2 = new RendererModel(this);
		armRight2.setRotationPoint(20.0F, -16.0F, 1.0F);
		bodyUpper.addChild(armRight2);
		setRotationAngle(armRight2, -0.1745F, 0.0F, -0.0873F);
		armRight2.cubeList.add(new ModelBox(armRight2, 66, 66, -5.0F, -1.0F, -6.0F, 13, 40, 12, 0.0F, false));

		legRight = new RendererModel(this);
		legRight.setRotationPoint(-6.0F, 0.0F, 0.0F);
		legRight.cubeList.add(new ModelBox(legRight, 104, 39, -5.0F, -5.0F, -5.0F, 10, 29, 10, 0.0F, false));

		legLeft = new RendererModel(this);
		legLeft.setRotationPoint(5.0F, 0.0F, 0.0F);
		legLeft.cubeList.add(new ModelBox(legLeft, 86, 0, -5.0F, -5.0F, -5.0F, 10, 29, 10, 0.0F, false));
	}

	@Override
	public void render(Entity entity, float f, float f1, float f2, float f3, float f4, float f5) {
		body.render(f5);
		legRight.render(f5);
		legLeft.render(f5);
	}

	public void setRotationAngle(RendererModel modelRenderer, float x, float y, float z) {
		modelRenderer.rotateAngleX = x;
		modelRenderer.rotateAngleY = y;
		modelRenderer.rotateAngleZ = z;
	}
}