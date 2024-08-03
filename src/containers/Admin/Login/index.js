import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Stack,
  InputGroup,
  InputRightElement,
  IconButton,
  Image,
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import RistekLogo from "assets/Beta/LogoSunjad-light.svg";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '' });

  const handleShowClick = () => setShowPassword(!showPassword);

  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = {};

    if (!username) {
      validationErrors.username = 'Masukan username';
    }
    if (!password) {
      validationErrors.password = 'Masukan password';
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      if (username === 'admin' && password === '12345678') {
        history.push('/feedback-recap');
      } else {
        setErrors({ username: 'Invalid username or password' });
      }
    }
  };

  return (
    <Box
      marginTop={-60}
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Helmet title="Admin Login" />
      <Stack spacing={8} align="center" w="full" maxW="md">
        <Image src={RistekLogo} alt="Logo" width={{ base: '250px', md: '350px' }} minWidth="200px" />
        <Text fontSize={{base: '2xl', md: '4xl'}} fontWeight="bold">
          Welcome Back! <Text as="span" color="primary.Purple">Admin</Text>
        </Text>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <FormControl id="username" isInvalid={errors.username} mt={4}>
            <FormLabel color="primary.Purple" fontWeight={'semibold'}>Username <Text as="span" color="red.300">*</Text></FormLabel>
            <Input
              type="text"
              placeholder="Masukan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <FormErrorMessage>{errors.username}</FormErrorMessage>
          </FormControl>

          <FormControl id="password" isInvalid={errors.password} mt={4}>
            <FormLabel color="primary.Purple" fontWeight={'semibold'}>Password <Text as="span" color="red.300">*</Text></FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement>
                <IconButton
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={handleShowClick}
                  variant="ghost"
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="purple"
            size="lg"
            w="full"
            mt={6}
          >
            Login
          </Button>
        </form>
      </Stack>
    </Box>
  );
};

export default AdminLogin;

