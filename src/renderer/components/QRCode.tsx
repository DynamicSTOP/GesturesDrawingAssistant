import { Box, Text, Theme } from "@radix-ui/themes"
import { QRCodeSVG } from "qrcode.react"

export const QRCode: React.FC<{ url: string }> = ({ url }) => <>
  <Theme appearance="light">
    <Box p="4">
      <QRCodeSVG value={url} size={160} />
    </Box>
  </Theme>
  <Text size="2" color="gray">
    {url}
  </Text>
</>
