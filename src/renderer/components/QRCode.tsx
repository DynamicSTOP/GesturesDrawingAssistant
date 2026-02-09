import { Box, Link, Text, Theme } from "@radix-ui/themes"
import { QRCodeSVG } from "qrcode.react"

export const QRCode: React.FC<{ url: string }> = ({ url }) => <>
  <Theme appearance="light">
    <Box p="4">
      <QRCodeSVG value={url} size={320} />
    </Box>
  </Theme>
  <Text size="6" color="gray">
    <Link href={url} target="_blank" style={{ textDecoration: "none" }}>{url}</Link>
  </Text>
</>
