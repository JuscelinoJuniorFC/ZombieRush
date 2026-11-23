import lief,sys,io
from PIL import Image
exe,png=sys.argv[1],sys.argv[2]
im=Image.open(png).convert('RGBA')
b=lief.PE.parse(exe)
rm=b.resources_manager
olds=list(rm.icons)
sizes=[(16,16),(32,32),(48,48),(256,256)]
for old,sz in zip(olds,sizes):
    bio=io.BytesIO();im.resize(sz,Image.LANCZOS).save(bio,format='ICO',sizes=[sz]);data=bio.getvalue()
    new=lief.PE.ResourceIcon.from_serialization(data)
    new.id=old.id;new.lang=old.lang;new.sublang=old.sublang
    rm.change_icon(old,new)
cfg=lief.PE.Builder.config_t();cfg.resources=True
b.write(exe+'.new',cfg) if False else b.write(exe+'.new')
print('ok')
