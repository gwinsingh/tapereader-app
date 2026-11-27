"""Fill the {{figure}} placeholders of a post template with the generated figure blocks. python compile.py figs.json template.md out.md"""
import sys, json, re
figs = json.load(open(sys.argv[1], encoding="utf-8"))
text = open(sys.argv[2], encoding="utf-8").read()
used = []
def sub(m):
    k = m.group(1)
    used.append(k)
    return "```figure\n" + json.dumps(figs[k], ensure_ascii=False, separators=(",", ":")) + "\n```"
out = re.sub(r"^\{\{(\w+)\}\}$", sub, text, flags=re.M)
open(sys.argv[3], "w", encoding="utf-8", newline="\n").write(out)
print(sys.argv[3], "figures filled:", ", ".join(used), "| bytes", len(out.encode("utf-8")))
