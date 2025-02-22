// Made with Blockbench 3.5.4
// Exported for Minecraft version 1.14
// Paste this class into your mod and generate all required imports


public class plant_snapper extends EntityModel {
	private final RendererModel body;
	private final RendererModel stem1;
	private final RendererModel stem2;
	private final RendererModel head;
	private final RendererModel jawUpper;
	private final RendererModel jawUpper2;
	private final RendererModel leaf1;
	private final RendererModel leaftip1;
	private final RendererModel leaf2;
	private final RendererModel leaftip2;

	public plant_snapper() {
		textureWidth = 64;
		textureHeight = 64;

		body = new RendererModel(this);
		body.setRotationPoint(0.0F, 12.0F, 0.0F);
		

		stem1 = new RendererModel(this);
		stem1.setRotationPoint(0.0F, 12.0F, 0.0F);
		body.addChild(stem1);
		setRotationAngle(stem1, -0.2618F, 0.0F, 0.0F);
		stem1.cubeList.add(new ModelBox(stem1, 0, 24, -1.0F, -6.0F, -1.0F, 2, 6, 2, 0.0F, false));

		stem2 = new RendererModel(this);
		stem2.setRotationPoint(0.0F, -6.0F, 0.0F);
		stem1.addChild(stem2);
		setRotationAngle(stem2, 0.5236F, 0.0F, 0.0F);
		stem2.cubeList.add(new ModelBox(stem2, 28, 14, -1.0F, -6.0F, -1.0F, 2, 6, 2, 0.0F, false));

		head = new RendererModel(this);
		head.setRotationPoint(0.0F, -6.0F, 0.0F);
		stem2.addChild(head);
		

		jawUpper = new RendererModel(this);
		jawUpper.setRotationPoint(0.0F, 0.0F, 0.0F);
		head.addChild(jawUpper);
		setRotationAngle(jawUpper, -0.3491F, 0.0F, 0.0F);
		jawUpper.cubeList.add(new ModelBox(jawUpper, 0, 0, -3.5F, -4.0F, -5.0F, 7, 3, 7, 0.0F, false));
		jawUpper.cubeList.add(new ModelBox(jawUpper, 0, 56, -3.5F, -1.0F, -5.0F, 7, 1, 7, 0.0F, false));

		jawUpper2 = new RendererModel(this);
		jawUpper2.setRotationPoint(0.0F, 0.0F, 0.0F);
		head.addChild(jawUpper2);
		jawUpper2.cubeList.add(new ModelBox(jawUpper2, 0, 14, -3.5F, -1.0F, -5.0F, 7, 2, 7, 0.0F, false));
		jawUpper2.cubeList.add(new ModelBox(jawUpper2, 1, 56, -3.5F, -2.0F, -5.0F, 7, 1, 7, 0.0F, false));

		leaf1 = new RendererModel(this);
		leaf1.setRotationPoint(0.0F, 12.0F, 0.0F);
		body.addChild(leaf1);
		setRotationAngle(leaf1, 0.3491F, -1.5708F, 0.0F);
		leaf1.cubeList.add(new ModelBox(leaf1, 37, 5, -3.0F, 0.0F, 0.0F, 6, 0, 5, 0.0F, false));

		leaftip1 = new RendererModel(this);
		leaftip1.setRotationPoint(0.0F, 0.0F, 5.0F);
		leaf1.addChild(leaftip1);
		setRotationAngle(leaftip1, -0.1745F, 0.0F, 0.0F);
		leaftip1.cubeList.add(new ModelBox(leaftip1, 37, 0, -3.0F, 0.0F, 0.0F, 6, 0, 5, 0.0F, false));

		leaf2 = new RendererModel(this);
		leaf2.setRotationPoint(0.0F, 12.0F, 0.0F);
		body.addChild(leaf2);
		setRotationAngle(leaf2, 0.3491F, 1.5708F, 0.0F);
		leaf2.cubeList.add(new ModelBox(leaf2, 37, 5, -3.0F, 0.0F, 0.0F, 6, 0, 5, 0.0F, false));

		leaftip2 = new RendererModel(this);
		leaftip2.setRotationPoint(0.0F, 0.0F, 5.0F);
		leaf2.addChild(leaftip2);
		setRotationAngle(leaftip2, -0.1745F, 0.0F, 0.0F);
		leaftip2.cubeList.add(new ModelBox(leaftip2, 37, 0, -3.0F, 0.0F, 0.0F, 6, 0, 5, 0.0F, false));
	}

	@Override
	public void render(Entity entity, float f, float f1, float f2, float f3, float f4, float f5) {
		body.render(f5);
	}

	public void setRotationAngle(RendererModel modelRenderer, float x, float y, float z) {
		modelRenderer.rotateAngleX = x;
		modelRenderer.rotateAngleY = y;
		modelRenderer.rotateAngleZ = z;
	}
}