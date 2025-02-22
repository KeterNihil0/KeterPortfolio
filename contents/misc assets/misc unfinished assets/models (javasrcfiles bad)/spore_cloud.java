// Made with Blockbench 3.5.4
// Exported for Minecraft version 1.14
// Paste this class into your mod and generate all required imports


public class spore_cloud extends EntityModel {
	private final RendererModel particle1;
	private final RendererModel particle2;
	private final RendererModel particle3;
	private final RendererModel particle4;

	public spore_cloud() {
		textureWidth = 16;
		textureHeight = 8;

		particle1 = new RendererModel(this);
		particle1.setRotationPoint(-4.0F, 24.0F, -4.0F);
		particle1.cubeList.add(new ModelBox(particle1, 0, 0, -4.0F, -4.0F, 0.0F, 8, 8, 0, 0.0F, false));

		particle2 = new RendererModel(this);
		particle2.setRotationPoint(-4.0F, 24.0F, 4.0F);
		particle2.cubeList.add(new ModelBox(particle2, 0, 0, -4.0F, -4.0F, 0.0F, 8, 8, 0, 0.0F, false));

		particle3 = new RendererModel(this);
		particle3.setRotationPoint(4.0F, 24.0F, 4.0F);
		particle3.cubeList.add(new ModelBox(particle3, 0, 0, -4.0F, -4.0F, 0.0F, 8, 8, 0, 0.0F, false));

		particle4 = new RendererModel(this);
		particle4.setRotationPoint(4.0F, 24.0F, -4.0F);
		particle4.cubeList.add(new ModelBox(particle4, 0, 0, -4.0F, -4.0F, 0.0F, 8, 8, 0, 0.0F, false));
	}

	@Override
	public void render(Entity entity, float f, float f1, float f2, float f3, float f4, float f5) {
		particle1.render(f5);
		particle2.render(f5);
		particle3.render(f5);
		particle4.render(f5);
	}

	public void setRotationAngle(RendererModel modelRenderer, float x, float y, float z) {
		modelRenderer.rotateAngleX = x;
		modelRenderer.rotateAngleY = y;
		modelRenderer.rotateAngleZ = z;
	}
}