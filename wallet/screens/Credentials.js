
import { Block, Text, theme } from "galio-framework";
function Credentials() {
    return(
        <Block center style={{ paddingHorizontal: theme.SIZES.BASE }}>
            <Text center size={34} style={{ paddingTop: theme.SIZES.BASE,paddingBottom: theme.SIZES.BASE / 2}}>
                Credentials 
            </Text>
            <Text
                center
                size={16}
                color={theme.COLORS.MUTED}
                style={{ paddingTop: theme.SIZES.BASE }}
            >
            Le lorem ipsum est, en imprimerie, une suite de mots sans signification utilisée à titre 
            provisoire pour calibrer une mise en page,le texte définitif venant remplacer le faux-texte 
            dès qu'il est prêt ou que la mise en page est achevée. 
            </Text>
        </Block>
    )
}

export default Credentials;
