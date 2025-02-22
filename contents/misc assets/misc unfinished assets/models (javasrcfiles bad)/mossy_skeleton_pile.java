// Made with Blockbench 3.5.4
// Exported for Minecraft version 1.14
// Paste this class into your mod and generate all required imports


public class mossy_skeleton_pile extends EntityModel {
	private final RendererModel bd;
	private final RendererModel rl;
	private final RendererModel ll;
	private final RendererModel ra;
	private final RendererModel la;
	private final RendererModel hd;
	private final RendererModel ht;

	public mossy_skeleton_pile() {
		textureWidth = 120;
		textureHeight = 16;

		bd = new RendererModel(this);
		bd.setRotationPoint(0.0F, 22.0F, 7.0F);
		setRotationAngle(bd, 0.1745F, -0.2618F, -0.0873F);
		bd.cubeList.add(new ModelBox(bd, 0, 0, -4.0F, -10.0F, -2.0F, 8, 12, 4, 0.0F, false));

		rl = new RendererModel(this);
		rl.setRotationPoint(-0.779F, -9.7912F, -4.3178F);
		bd.addChild(rl);
		setRotationAngle(rl, 0.0F, 0.0873F, 0.0F);
		rl.cubeList.add(new ModelBox(rl, 104, 0, -1.0F, 0.0F, -1.0F, 2, 12, 2, 0.0F, false));

		ll = new RendererModel(this);
		ll.setRotationPoint(2.0F, -3.0F, -5.0F);
		bd.addChild(ll);
		setRotationAngle(ll, -1.309F, 0.0F, 0.0F);
		ll.cubeList.add(new ModelBox(ll, 112, 0, -1.0F, 0.0F, -1.0F, 2, 12, 2, 0.0F, true));

		ra = new RendererModel(this);
		ra.setRotationPoint(-5.2612F, -0.6743F, -3.2183F);
		bd.addChild(ra);
		setRotationAngle(ra, 0.96F, 0.0F, 1.309F);
		ra.cubeList.add(new ModelBox(ra, 88, 0, -1.0F, -2.0F, -1.0F, 2, 12, 2, 0.0F, false));

		la = new RendererModel(this);
		la.setRotationPoint(4.0377F, -0.0411F, -3.731F);
		bd.addChild(la);
		setRotationAngle(la, 1.2217F, 2.2689F, -0.1746F);
		la.cubeList.add(new ModelBox(la, 96, 0, -1.0F, -1.0F, -1.0F, 2, 12, 2, 0.0F, true));

		hd = new RendererModel(this);
		hd.setRotationPoint(-3.5336F, -1.2686F, -10.1869F);
		bd.addChild(hd);
		setRotationAngle(hd, -0.6109F, 0.3491F, -0.96F);
		hd.cubeList.add(new ModelBox(hd, 24, 0, -4.0F, -8.0F, -4.0F, 8, 8, 8, 0.0F, false));

		ht = new RendererModel(this);
		ht.setRotationPoint(0.0F, 0.0F, 0.0F);
		hd.addChild(ht);
		ht.cubeList.add(new ModelBox(ht, 56, 0, -4.0F, -8.0F, -4.0F, 8, 8, 8, 0.5F, false));
	}

	@Override
	public void render(Entity entity, float f, float f1, float f2, float f3, float f4, float f5) {
		bd.render(f5);
	}

	public void setRotationAngle(RendererModel modelRenderer, float x, float y, float z) {
		modelRenderer.rotateAngleX = x;
		modelRenderer.rotateAngleY = y;
		modelRenderer.rotateAngleZ = z;
	}
}