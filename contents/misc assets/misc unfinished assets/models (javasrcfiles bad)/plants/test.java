// Made with Blockbench 3.5.4
// Exported for Minecraft version 1.14
// Paste this class into your mod and generate all required imports


public class test extends EntityModel {
	private final RendererModel mask;

	public test() {
		textureWidth = 16;
		textureHeight = 16;

		mask = new RendererModel(this);
		mask.setRotationPoint(0.0F, 24.0F, 0.0F);
		mask.cubeList.add(new ModelBox(mask, 0, 0, -8.0F, -8.0F, -8.0F, 16, 16, 16, 1.0F, false));
	}

	@Override
	public void render(Entity entity, float f, float f1, float f2, float f3, float f4, float f5) {
		mask.render(f5);
	}

	public void setRotationAngle(RendererModel modelRenderer, float x, float y, float z) {
		modelRenderer.rotateAngleX = x;
		modelRenderer.rotateAngleY = y;
		modelRenderer.rotateAngleZ = z;
	}
}