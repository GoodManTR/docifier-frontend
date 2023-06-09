import { Box, Container, Unstable_Grid2 as Grid, Stack, SvgIcon, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useAuthContext } from '../../contexts/auth-context'
import { MainLayout } from '../../layouts/dashboard/layout'
import { DocSideNav } from './sections/sideNav'
import { EditDoc } from './sections/editDoc'

const DocSettings = () => {
  const auth = useAuthContext() as any
  const [doc, setDocument] = useState()

  useEffect(() => {
    const getDoc = async () => {
      const queryParams = new URLSearchParams(window.location.search)
      const id = queryParams.get('id')
  
      const docs = ((await auth.getDocs()) as any[]) || []
      const existDoc = docs.find((doc) => doc.docId === id)
  
      if (!existDoc) {
        window.location.href = '/'
      }

      document.title = `Docifier - ${existDoc!.alias} - Overview`;
      setDocument(existDoc)
    }

    getDoc()
  }, [])

  return (
    <MainLayout>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Grid container spacing={5}>
          <Grid xs={12} md={4} lg={2}>
            <DocSideNav />
          </Grid>
          <Grid xs={12} md={8} lg={10}>


          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  )
}

export default DocSettings
